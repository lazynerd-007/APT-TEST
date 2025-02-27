"""
Celery tasks for the analytics service.
"""
import logging
import numpy as np
import pandas as pd
from datetime import timedelta
from celery import shared_task
from django.db.models import Avg, Count, F, Q, Sum
from django.utils import timezone
from .models import (
    AssessmentAnalytics, QuestionAnalytics, CandidateAnalytics, 
    BiasMetric, SkillTag, QuestionSkill
)
from assessments.models import (
    Assessment, Question, CandidateTest, CandidateAnswer, 
    CodeSubmission, TestCase
)
from users.models import User

logger = logging.getLogger(__name__)


@shared_task
def update_assessment_analytics(assessment_id):
    """
    Update analytics for an assessment.
    
    Args:
        assessment_id (str): ID of the assessment
    """
    try:
        assessment = Assessment.objects.get(id=assessment_id)
        
        # Get all candidate tests for this assessment
        candidate_tests = CandidateTest.objects.filter(assessment_id=assessment_id)
        total_candidates = candidate_tests.count()
        
        if total_candidates == 0:
            logger.info(f"No candidates found for assessment {assessment_id}")
            return
        
        # Calculate completion rate
        completed_tests = candidate_tests.filter(status='completed')
        completion_rate = completed_tests.count() / total_candidates if total_candidates > 0 else 0
        
        # Calculate pass rate
        passed_tests = completed_tests.filter(score__gte=F('assessment__passing_score'))
        pass_rate = passed_tests.count() / completed_tests.count() if completed_tests.count() > 0 else 0
        
        # Calculate average score
        average_score = completed_tests.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        
        # Calculate average completion time
        completed_with_times = completed_tests.exclude(end_time=None)
        completion_times = [
            (test.end_time - test.start_time).total_seconds() / 60  # Convert to minutes
            for test in completed_with_times
        ]
        average_completion_time = sum(completion_times) / len(completion_times) if completion_times else 0
        
        # Calculate score distribution
        score_distribution = {}
        for i in range(0, 101, 10):
            range_key = f"{i}-{i+9}" if i < 100 else "100"
            count = completed_tests.filter(score__gte=i, score__lt=i+10).count()
            score_distribution[range_key] = count
        
        # Create or update assessment analytics
        analytics, created = AssessmentAnalytics.objects.update_or_create(
            assessment=assessment,
            defaults={
                'total_candidates': total_candidates,
                'completion_rate': completion_rate,
                'pass_rate': pass_rate,
                'average_score': average_score,
                'average_completion_time': average_completion_time,
                'score_distribution': score_distribution,
            }
        )
        
        # Update question analytics
        update_question_analytics.delay(assessment_id, analytics.id)
        
        logger.info(f"Updated analytics for assessment {assessment_id}")
        return analytics.id
    
    except Exception as e:
        logger.exception(f"Error updating assessment analytics: {e}")
        return None


@shared_task
def update_question_analytics(assessment_id, assessment_analytics_id):
    """
    Update analytics for questions in an assessment.
    
    Args:
        assessment_id (str): ID of the assessment
        assessment_analytics_id (str): ID of the assessment analytics
    """
    try:
        assessment = Assessment.objects.get(id=assessment_id)
        assessment_analytics = AssessmentAnalytics.objects.get(id=assessment_analytics_id)
        
        # Get all questions for this assessment
        assessment_tests = assessment.tests.all()
        for assessment_test in assessment_tests:
            test = assessment_test.test
            questions = test.questions.all()
            
            for question in questions:
                # Get all answers for this question
                answers = CandidateAnswer.objects.filter(
                    question=question,
                    candidate_test__assessment=assessment,
                    candidate_test__status='completed'
                )
                
                if not answers.exists():
                    continue
                
                # Calculate average score
                average_score = answers.aggregate(avg_score=Avg('score'))['avg_score'] or 0
                
                # Calculate success rate (score >= 70% of max points)
                success_threshold = question.points * 0.7
                successful_answers = answers.filter(score__gte=success_threshold)
                success_rate = successful_answers.count() / answers.count() if answers.count() > 0 else 0
                
                # Calculate average time (simplified)
                average_time = 5  # Placeholder - would need timestamps for answers
                
                # Create or update question analytics
                QuestionAnalytics.objects.update_or_create(
                    question=question,
                    assessment_analytics=assessment_analytics,
                    defaults={
                        'average_score': average_score,
                        'success_rate': success_rate,
                        'average_time': average_time,
                    }
                )
        
        logger.info(f"Updated question analytics for assessment {assessment_id}")
        return True
    
    except Exception as e:
        logger.exception(f"Error updating question analytics: {e}")
        return False


@shared_task
def generate_candidate_analytics(candidate_test_id):
    """
    Generate analytics for a candidate's test.
    
    Args:
        candidate_test_id (str): ID of the candidate test
    """
    try:
        candidate_test = CandidateTest.objects.get(id=candidate_test_id)
        
        if candidate_test.status != 'completed':
            logger.info(f"Candidate test {candidate_test_id} is not completed")
            return None
        
        # Calculate completion time
        if candidate_test.end_time and candidate_test.start_time:
            completion_time = (candidate_test.end_time - candidate_test.start_time).total_seconds() / 60
        else:
            completion_time = 0
        
        # Get all answers for this test
        answers = CandidateAnswer.objects.filter(candidate_test=candidate_test)
        
        # Calculate skill scores
        skill_scores = {}
        strengths = []
        weaknesses = []
        
        for answer in answers:
            question = answer.question
            
            # Get skills for this question
            question_skills = QuestionSkill.objects.filter(question=question)
            
            for question_skill in question_skills:
                skill = question_skill.skill
                weight = question_skill.weight
                
                # Calculate weighted score for this skill
                if answer.score is not None:
                    weighted_score = answer.score * weight
                    
                    # Add to skill scores
                    if skill.name in skill_scores:
                        skill_scores[skill.name]['score'] += weighted_score
                        skill_scores[skill.name]['weight'] += weight
                    else:
                        skill_scores[skill.name] = {
                            'score': weighted_score,
                            'weight': weight,
                            'category': skill.category
                        }
        
        # Normalize skill scores
        normalized_skill_scores = {}
        for skill_name, data in skill_scores.items():
            if data['weight'] > 0:
                normalized_score = data['score'] / data['weight']
                normalized_skill_scores[skill_name] = normalized_score
                
                # Determine strengths and weaknesses
                if normalized_score >= 80:
                    strengths.append(skill_name)
                elif normalized_score <= 40:
                    weaknesses.append(skill_name)
        
        # Create or update candidate analytics
        analytics, created = CandidateAnalytics.objects.update_or_create(
            candidate=candidate_test.candidate,
            candidate_test=candidate_test,
            defaults={
                'strengths': strengths,
                'weaknesses': weaknesses,
                'skill_scores': normalized_skill_scores,
                'completion_time': completion_time,
            }
        )
        
        logger.info(f"Generated analytics for candidate test {candidate_test_id}")
        return analytics.id
    
    except Exception as e:
        logger.exception(f"Error generating candidate analytics: {e}")
        return None


@shared_task
def detect_bias(assessment_id):
    """
    Detect potential bias in assessment results.
    
    Args:
        assessment_id (str): ID of the assessment
    """
    try:
        assessment = Assessment.objects.get(id=assessment_id)
        
        # Get all completed tests for this assessment
        completed_tests = CandidateTest.objects.filter(
            assessment=assessment,
            status='completed'
        ).select_related('candidate')
        
        if completed_tests.count() < 10:
            logger.info(f"Not enough completed tests for bias detection: {completed_tests.count()}")
            return
        
        # This is a simplified implementation
        # In a real system, you would use demographic data and more sophisticated statistical methods
        
        # Example: Check for bias based on experience years
        candidates = User.objects.filter(
            id__in=completed_tests.values_list('candidate_id', flat=True)
        ).select_related('candidate_profile')
        
        # Group candidates by experience
        experience_groups = {
            'junior': [],
            'mid': [],
            'senior': []
        }
        
        for candidate in candidates:
            if hasattr(candidate, 'candidate_profile'):
                experience = candidate.candidate_profile.experience_years
                if experience < 3:
                    group = 'junior'
                elif experience < 7:
                    group = 'mid'
                else:
                    group = 'senior'
                
                # Find their test
                for test in completed_tests:
                    if test.candidate_id == candidate.id:
                        experience_groups[group].append(test.score)
                        break
        
        # Calculate average scores for each group
        group_averages = {}
        for group, scores in experience_groups.items():
            if scores:
                group_averages[group] = sum(scores) / len(scores)
            else:
                group_averages[group] = None
        
        # Check for significant differences
        valid_groups = {k: v for k, v in group_averages.items() if v is not None}
        if len(valid_groups) >= 2:
            avg_scores = list(valid_groups.values())
            max_diff = max(avg_scores) - min(avg_scores)
            
            # If difference is more than 15 points, flag as potential bias
            if max_diff > 15:
                # Find groups with max and min scores
                max_group = max(valid_groups.items(), key=lambda x: x[1])[0]
                min_group = min(valid_groups.items(), key=lambda x: x[1])[0]
                
                # Record bias metric
                BiasMetric.objects.create(
                    assessment=assessment,
                    metric_name='score_difference_by_experience',
                    metric_value=max_diff,
                    demographic_group=min_group,
                    comparison_group=max_group,
                    is_significant=True
                )
                
                logger.info(f"Detected potential bias in assessment {assessment_id}: "
                           f"{max_group} vs {min_group}, diff={max_diff}")
        
        return True
    
    except Exception as e:
        logger.exception(f"Error detecting bias: {e}")
        return False


@shared_task
def update_all_analytics():
    """Update analytics for all active assessments."""
    try:
        # Get all active assessments
        active_assessments = Assessment.objects.filter(is_active=True)
        
        for assessment in active_assessments:
            update_assessment_analytics.delay(assessment.id)
            detect_bias.delay(assessment.id)
        
        logger.info(f"Scheduled analytics updates for {active_assessments.count()} assessments")
        return True
    
    except Exception as e:
        logger.exception(f"Error scheduling analytics updates: {e}")
        return False 