"""
Celery tasks for the execution service.
"""
import uuid
import os
import tempfile
import docker
import logging
import resource
import difflib
import requests
from Levenshtein import distance
from celery import shared_task
from django.conf import settings
from django.utils import timezone
from .models import ExecutionResult, PlagiarismResult, SimilarSubmission, ExternalSource, SandboxContainer
from assessments.models import CodeSubmission, TestCase

logger = logging.getLogger(__name__)

# Docker client
docker_client = docker.from_env()

# Language configurations
LANGUAGE_CONFIGS = {
    'python': {
        'image': 'python:3.9-slim',
        'extension': 'py',
        'command': 'python',
        'timeout': 10,
        'memory_limit': '128m',
    },
    'javascript': {
        'image': 'node:14-alpine',
        'extension': 'js',
        'command': 'node',
        'timeout': 10,
        'memory_limit': '128m',
    },
    'java': {
        'image': 'openjdk:11-jre-slim',
        'extension': 'java',
        'command': 'java',
        'timeout': 15,
        'memory_limit': '256m',
    },
    'cpp': {
        'image': 'gcc:latest',
        'extension': 'cpp',
        'command': 'g++ -o program program.cpp && ./program',
        'timeout': 10,
        'memory_limit': '128m',
    },
}

@shared_task
def execute_code(code, language, execution_id=None, test_cases=None, timeout=None):
    """
    Execute code in a sandboxed environment.
    
    Args:
        code (str): The code to execute
        language (str): The programming language
        execution_id (str, optional): Unique ID for this execution
        test_cases (list, optional): List of test cases to run
        timeout (int, optional): Timeout in seconds
        
    Returns:
        dict: Execution results
    """
    if execution_id is None:
        execution_id = str(uuid.uuid4())
    
    # Create or get execution result
    execution_result, _ = ExecutionResult.objects.get_or_create(
        execution_id=execution_id,
        defaults={'status': 'pending'}
    )
    
    # Update status to running
    execution_result.status = 'running'
    execution_result.save()
    
    # Get language configuration
    if language not in LANGUAGE_CONFIGS:
        execution_result.status = 'failed'
        execution_result.stderr = f"Unsupported language: {language}"
        execution_result.save()
        return {'status': 'failed', 'error': f"Unsupported language: {language}"}
    
    lang_config = LANGUAGE_CONFIGS[language]
    
    # Set timeout
    if timeout is None:
        timeout = lang_config['timeout']
    
    try:
        # Create temporary directory for code
        with tempfile.TemporaryDirectory() as temp_dir:
            # Write code to file
            file_path = os.path.join(temp_dir, f"program.{lang_config['extension']}")
            with open(file_path, 'w') as f:
                f.write(code)
            
            # Prepare container
            container = docker_client.containers.run(
                image=lang_config['image'],
                command=f"{lang_config['command']} /code/program.{lang_config['extension']}",
                volumes={temp_dir: {'bind': '/code', 'mode': 'ro'}},
                mem_limit=lang_config['memory_limit'],
                network_mode='none',
                detach=True,
                stdout=True,
                stderr=True,
            )
            
            # Record container
            SandboxContainer.objects.create(
                container_id=container.id,
                execution_id=execution_id,
                language=language,
                status='running'
            )
            
            # Wait for container to finish or timeout
            try:
                container.wait(timeout=timeout)
                status = 'completed'
            except Exception:
                container.stop()
                status = 'timeout'
            
            # Get logs
            stdout = container.logs(stdout=True, stderr=False).decode('utf-8')
            stderr = container.logs(stdout=False, stderr=True).decode('utf-8')
            
            # Get stats
            stats = container.stats(stream=False)
            memory_usage = stats.get('memory_stats', {}).get('usage', 0) // 1024  # Convert to KB
            
            # Clean up
            container.remove()
            
            # Update container status
            sandbox_container = SandboxContainer.objects.get(container_id=container.id)
            sandbox_container.status = 'removed'
            sandbox_container.save()
            
            # Update execution result
            execution_result.status = status
            execution_result.stdout = stdout
            execution_result.stderr = stderr
            execution_result.execution_time = timeout if status == 'timeout' else 0  # Placeholder
            execution_result.memory_usage = memory_usage
            execution_result.save()
            
            # Run test cases if provided
            test_results = []
            if test_cases and status == 'completed':
                for test_case in test_cases:
                    # TODO: Implement test case execution
                    pass
            
            return {
                'execution_id': execution_id,
                'status': status,
                'stdout': stdout,
                'stderr': stderr,
                'execution_time': execution_result.execution_time,
                'memory_usage': memory_usage,
                'test_results': test_results
            }
    
    except Exception as e:
        logger.exception(f"Error executing code: {e}")
        execution_result.status = 'failed'
        execution_result.stderr = str(e)
        execution_result.save()
        return {'status': 'failed', 'error': str(e)}


@shared_task
def check_plagiarism(code_submission_id, language, question_id=None):
    """
    Check for plagiarism in code submissions.
    
    Args:
        code_submission_id (str): ID of the code submission
        language (str): Programming language
        question_id (str, optional): ID of the question
        
    Returns:
        dict: Plagiarism detection results
    """
    try:
        # Get code submission
        code_submission = CodeSubmission.objects.get(id=code_submission_id)
        code = code_submission.code_content
        
        # Create plagiarism result
        plagiarism_result = PlagiarismResult.objects.create(
            code_submission_id=code_submission_id,
            plagiarism_score=0.0
        )
        
        # Check against other submissions for the same question
        if question_id:
            similar_submissions = []
            
            # Get other submissions for the same question
            other_submissions = CodeSubmission.objects.filter(
                candidate_answer__question_id=question_id,
                language=language
            ).exclude(id=code_submission_id)
            
            for submission in other_submissions:
                # Calculate similarity using Levenshtein distance
                similarity = 1.0 - (distance(code, submission.code_content) / max(len(code), len(submission.code_content)))
                
                # Find matching lines
                matching_lines = []
                code_lines = code.splitlines()
                submission_lines = submission.code_content.splitlines()
                
                matcher = difflib.SequenceMatcher(None, code_lines, submission_lines)
                for block in matcher.get_matching_blocks():
                    if block.size > 1:  # Only consider blocks of at least 2 lines
                        for i in range(block.a, block.a + block.size):
                            matching_lines.append(i)
                
                # Only record if similarity is above threshold
                if similarity > 0.7:
                    similar_submission = SimilarSubmission.objects.create(
                        plagiarism_result=plagiarism_result,
                        candidate_id=submission.candidate_answer.candidate_test.candidate_id,
                        similarity_score=similarity * 100,
                        matching_lines=matching_lines
                    )
                    similar_submissions.append({
                        'candidate_id': str(similar_submission.candidate_id),
                        'similarity_score': similar_submission.similarity_score,
                        'matching_lines': similar_submission.matching_lines
                    })
            
            # Check against external sources (simplified)
            external_sources = []
            # TODO: Implement external source checking with a real API
            # This is a placeholder for demonstration
            
            # Calculate overall plagiarism score
            if similar_submissions:
                max_similarity = max(sub['similarity_score'] for sub in similar_submissions)
                plagiarism_score = max_similarity
            else:
                plagiarism_score = 0.0
            
            # Update plagiarism result
            plagiarism_result.plagiarism_score = plagiarism_score
            plagiarism_result.save()
            
            # Update code submission
            code_submission.plagiarism_score = plagiarism_score
            code_submission.save()
            
            return {
                'plagiarism_score': plagiarism_score,
                'similar_submissions': similar_submissions,
                'external_sources': external_sources
            }
        
        return {'plagiarism_score': 0.0, 'similar_submissions': [], 'external_sources': []}
    
    except Exception as e:
        logger.exception(f"Error checking plagiarism: {e}")
        return {'error': str(e)} 