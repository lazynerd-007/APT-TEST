"""
Assessment models for the BLUAPT platform.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User


class TestLibrary(models.Model):
    """Repository of reusable tests."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tests')
    category = models.CharField(max_length=50)
    difficulty = models.CharField(max_length=20, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    ])
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Test libraries"
    
    def __str__(self):
        return self.title


class Question(models.Model):
    """Individual questions within tests."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    test = models.ForeignKey(TestLibrary, on_delete=models.CASCADE, related_name='questions')
    content = models.TextField()
    type = models.CharField(max_length=50, choices=[
        ('mcq', 'Multiple Choice'),
        ('coding', 'Coding'),
        ('essay', 'Essay'),
        ('file_upload', 'File Upload'),
    ])
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ])
    points = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.test.title} - {self.content[:50]}..."


class Answer(models.Model):
    """Predefined answers for questions (for MCQs)."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    is_correct = models.BooleanField(default=False)
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.question.content[:30]}... - {self.content[:30]}..."


class TestCase(models.Model):
    """Test cases for coding questions."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='test_cases')
    input_data = models.TextField()
    expected_output = models.TextField()
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Test case for {self.question.content[:30]}..."


class Assessment(models.Model):
    """Configured assessment instances for specific hiring needs."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_assessments')
    time_limit = models.PositiveIntegerField(help_text="Time limit in minutes")
    passing_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title


class AssessmentTest(models.Model):
    """Junction table linking assessments to tests from the library."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='tests')
    test = models.ForeignKey(TestLibrary, on_delete=models.CASCADE, related_name='assessments')
    weight = models.DecimalField(
        max_digits=3, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(1)]
    )
    order = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return f"{self.assessment.title} - {self.test.title}"


class CandidateTest(models.Model):
    """Records of assessments taken by candidates."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tests')
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='candidate_tests')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    status = models.CharField(max_length=20, choices=[
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ], default='in_progress')
    current_test_index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.candidate.email} - {self.assessment.title}"
    
    @property
    def is_completed(self):
        """Check if the test is completed."""
        return self.status == 'completed'
    
    @property
    def is_passed(self):
        """Check if the candidate passed the test."""
        if self.score is None or not self.is_completed:
            return False
        return self.score >= self.assessment.passing_score


class CandidateAnswer(models.Model):
    """Individual answers submitted by candidates."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate_test = models.ForeignKey(CandidateTest, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='candidate_answers')
    answer_content = models.TextField()
    score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Answer for {self.question.content[:30]}..."


class CodeSubmission(models.Model):
    """Detailed information about code submissions."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate_answer = models.OneToOneField(CandidateAnswer, on_delete=models.CASCADE, related_name='code_submission')
    language = models.CharField(max_length=50)
    code_content = models.TextField()
    execution_time = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    memory_usage = models.PositiveIntegerField(null=True, blank=True)
    passed_test_cases = models.PositiveIntegerField(default=0)
    total_test_cases = models.PositiveIntegerField(default=0)
    plagiarism_score = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Code submission for {self.candidate_answer.question.content[:30]}..." 