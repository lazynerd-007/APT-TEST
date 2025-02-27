"""
Analytics models for the BLUAPT platform.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from assessments.models import Assessment, Question, CandidateTest
from users.models import User


class AssessmentAnalytics(models.Model):
    """Model to store aggregated analytics for assessments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.OneToOneField(Assessment, on_delete=models.CASCADE, related_name='analytics')
    total_candidates = models.PositiveIntegerField(default=0)
    completion_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        default=0
    )
    pass_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        default=0
    )
    average_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    average_completion_time = models.PositiveIntegerField(default=0)
    score_distribution = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Assessment analytics"
    
    def __str__(self):
        return f"Analytics for {self.assessment.title}"


class QuestionAnalytics(models.Model):
    """Model to store analytics for individual questions."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.OneToOneField(Question, on_delete=models.CASCADE, related_name='analytics')
    assessment_analytics = models.ForeignKey(AssessmentAnalytics, on_delete=models.CASCADE, related_name='question_analytics')
    average_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        default=0
    )
    success_rate = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        default=0
    )
    average_time = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Question analytics"
    
    def __str__(self):
        return f"Analytics for question: {self.question.content[:30]}..."


class CandidateAnalytics(models.Model):
    """Model to store analytics for individual candidates."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics')
    candidate_test = models.OneToOneField(CandidateTest, on_delete=models.CASCADE, related_name='analytics')
    strengths = models.JSONField(default=list)
    weaknesses = models.JSONField(default=list)
    skill_scores = models.JSONField(default=dict)
    completion_time = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Candidate analytics"
    
    def __str__(self):
        return f"Analytics for {self.candidate.email} on {self.candidate_test.assessment.title}"


class BiasMetric(models.Model):
    """Model to store bias metrics for assessments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='bias_metrics')
    metric_name = models.CharField(max_length=100)
    metric_value = models.DecimalField(max_digits=5, decimal_places=2)
    demographic_group = models.CharField(max_length=100, blank=True)
    comparison_group = models.CharField(max_length=100, blank=True)
    is_significant = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.metric_name} for {self.assessment.title}"


class SkillTag(models.Model):
    """Model to store skill tags for questions and assessments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class QuestionSkill(models.Model):
    """Junction table linking questions to skills."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='skills')
    skill = models.ForeignKey(SkillTag, on_delete=models.CASCADE, related_name='questions')
    weight = models.DecimalField(
        max_digits=3, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.question.content[:30]}... - {self.skill.name}" 