"""
Execution service models for the BLUAPT platform.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class ExecutionResult(models.Model):
    """Model to store code execution results."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    execution_id = models.UUIDField(unique=True)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('timeout', 'Timeout'),
    ], default='pending')
    stdout = models.TextField(blank=True)
    stderr = models.TextField(blank=True)
    execution_time = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    memory_usage = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Execution {self.execution_id} - {self.status}"


class PlagiarismResult(models.Model):
    """Model to store plagiarism detection results."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code_submission_id = models.UUIDField()
    plagiarism_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Plagiarism result for {self.code_submission_id} - {self.plagiarism_score}%"


class SimilarSubmission(models.Model):
    """Model to store similar submissions found during plagiarism detection."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plagiarism_result = models.ForeignKey(PlagiarismResult, on_delete=models.CASCADE, related_name='similar_submissions')
    candidate_id = models.UUIDField()
    similarity_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    matching_lines = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Similar submission for {self.plagiarism_result.code_submission_id} - {self.similarity_score}%"


class ExternalSource(models.Model):
    """Model to store external sources found during plagiarism detection."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plagiarism_result = models.ForeignKey(PlagiarismResult, on_delete=models.CASCADE, related_name='external_sources')
    url = models.URLField(max_length=255)
    similarity_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    matching_lines = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"External source for {self.plagiarism_result.code_submission_id} - {self.similarity_score}%"


class SandboxContainer(models.Model):
    """Model to track Docker containers used for code execution."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    container_id = models.CharField(max_length=64)
    execution_id = models.UUIDField()
    language = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=[
        ('created', 'Created'),
        ('running', 'Running'),
        ('exited', 'Exited'),
        ('removed', 'Removed'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Container {self.container_id} for execution {self.execution_id}" 