"""
Assessment models for the BLUAPT platform.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User
from skills.models import Skill


class TestLibrary(models.Model):
    """Repository of reusable tests."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_test_libraries')
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
    """Assessment model for representing a collection of tests."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    time_limit = models.IntegerField(help_text="Time limit in minutes")
    passing_score = models.IntegerField(help_text="Passing score percentage")
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name="created_assessments"
    )
    organization = models.ForeignKey(
        'users.Organization',
        on_delete=models.CASCADE,
        related_name="assessments"
    )
    skills = models.ManyToManyField(
        Skill,
        through='AssessmentSkill',
        related_name="assessments"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class AssessmentSkill(models.Model):
    """Mapping between assessments and skills with importance level."""
    IMPORTANCE_CHOICES = [
        ('primary', 'Primary'),
        ('secondary', 'Secondary'),
        ('tertiary', 'Tertiary'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE)
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE)
    importance = models.CharField(
        max_length=20,
        choices=IMPORTANCE_CHOICES,
        default='secondary'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['assessment', 'skill']

    def __str__(self):
        return f"{self.assessment.title} - {self.skill.name}"


class Test(models.Model):
    """Test model for representing a specific test within an assessment."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructions = models.TextField()
    time_limit = models.IntegerField(help_text="Time limit in minutes", null=True, blank=True)
    category = models.CharField(max_length=100)
    difficulty = models.CharField(max_length=50)
    created_by = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name="created_tests"
    )
    organization = models.ForeignKey(
        'users.Organization',
        on_delete=models.CASCADE,
        related_name="tests"
    )
    skills = models.ManyToManyField(
        Skill,
        related_name="tests"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class AssessmentTest(models.Model):
    """Mapping between assessments and tests with weight and order."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="assessment_tests"
    )
    test = models.ForeignKey(
        Test,
        on_delete=models.CASCADE,
        related_name="assessment_tests"
    )
    weight = models.IntegerField(help_text="Weight percentage for this test in the assessment")
    order = models.IntegerField(help_text="Order of this test in the assessment")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['assessment', 'test']
        ordering = ['order']

    def __str__(self):
        return f"{self.assessment.title} - {self.test.title}"


class CandidateAssessment(models.Model):
    """Model for tracking a candidate's progress through an assessment."""
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name="candidate_assessments"
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="candidate_assessments"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    score = models.FloatField(null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.candidate.email} - {self.assessment.title}"


class CandidateTest(models.Model):
    """Model for tracking a candidate's progress through a test."""
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate_assessment = models.ForeignKey(
        CandidateAssessment,
        on_delete=models.CASCADE,
        related_name="candidate_tests"
    )
    test = models.ForeignKey(
        Test,
        on_delete=models.CASCADE,
        related_name="candidate_tests"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    score = models.FloatField(null=True, blank=True)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.candidate_assessment.candidate.email} - {self.test.title}"


class CandidateSkillScore(models.Model):
    """Model for tracking a candidate's skill scores from assessments."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name="skill_scores"
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name="candidate_scores"
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.CASCADE,
        related_name="skill_scores"
    )
    score = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['candidate', 'skill', 'assessment']

    def __str__(self):
        return f"{self.candidate.email} - {self.skill.name} - {self.score}"


class CandidateAnswer(models.Model):
    """Individual answers submitted by candidates."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate_test = models.ForeignKey(CandidateTest, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='candidate_answers')
    content = models.TextField()
    is_correct = models.BooleanField(default=False)
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
        return f"Answer by {self.candidate_test.candidate_assessment.candidate} for {self.question}"


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