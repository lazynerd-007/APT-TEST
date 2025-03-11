"""
Views for the assessments app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db import models
from .models import (
    Assessment, 
    AssessmentSkill,
    Test, 
    AssessmentTest, 
    Question,
    CandidateAssessment,
    CandidateTest,
    CandidateSkillScore,
    Answer,
    CandidateAnswer
)
from .serializers import (
    AssessmentSerializer,
    AssessmentCreateUpdateSerializer,
    AssessmentSkillSerializer,
    TestSerializer,
    AssessmentTestSerializer,
    QuestionSerializer,
    CandidateAssessmentSerializer,
    CandidateTestSerializer,
    CandidateSkillScoreSerializer,
    AnswerSerializer,
    CandidateAnswerSerializer
)
from skills.models import Skill
import csv
import json
from django.http import HttpResponse
from io import StringIO
from django.utils import timezone


class AssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for the Assessment model."""
    queryset = Assessment.objects.all()
    # Explicitly set permission_classes to AllowAny to disable authentication
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['created_by', 'organization', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'updated_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AssessmentCreateUpdateSerializer
        return AssessmentSerializer
    
    def get_queryset(self):
        """Filter assessments by organization."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Skip organization filtering if user is not authenticated
        if not user.is_authenticated:
            return queryset
        
        # Filter by organization if user is not admin
        if not user.is_staff:
            queryset = queryset.filter(organization=user.organization)
        
        # Filter by skill if provided
        skill_id = self.request.query_params.get('skill_id')
        if skill_id:
            queryset = queryset.filter(skills__id=skill_id)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def skills(self, request, pk=None):
        """Get skills for an assessment."""
        assessment = self.get_object()
        assessment_skills = AssessmentSkill.objects.filter(assessment=assessment)
        serializer = AssessmentSkillSerializer(assessment_skills, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_skill(self, request, pk=None):
        """Add a skill to an assessment."""
        assessment = self.get_object()
        skill_id = request.data.get('skill_id')
        importance = request.data.get('importance', 'secondary')
        
        if not skill_id:
            return Response(
                {'error': 'skill_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            skill = Skill.objects.get(id=skill_id)
        except Skill.DoesNotExist:
            return Response(
                {'error': 'Skill not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if skill already exists
        if AssessmentSkill.objects.filter(assessment=assessment, skill=skill).exists():
            return Response(
                {'error': 'Skill already added to this assessment'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        assessment_skill = AssessmentSkill.objects.create(
            assessment=assessment,
            skill=skill,
            importance=importance
        )
        
        serializer = AssessmentSkillSerializer(assessment_skill)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'])
    def remove_skill(self, request, pk=None):
        """Remove a skill from an assessment."""
        assessment = self.get_object()
        skill_id = request.data.get('skill_id')
        
        if not skill_id:
            return Response(
                {'error': 'skill_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            assessment_skill = AssessmentSkill.objects.get(
                assessment=assessment,
                skill_id=skill_id
            )
        except AssessmentSkill.DoesNotExist:
            return Response(
                {'error': 'Skill not found in this assessment'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        assessment_skill.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=True, methods=['get'])
    def tests(self, request, pk=None):
        """Get tests for an assessment."""
        assessment = self.get_object()
        assessment_tests = AssessmentTest.objects.filter(assessment=assessment)
        serializer = AssessmentTestSerializer(assessment_tests, many=True)
        return Response(serializer.data)


class TestViewSet(viewsets.ModelViewSet):
    """ViewSet for the Test model."""
    queryset = Test.objects.all()
    serializer_class = TestSerializer
    # For development purposes, allow unauthenticated access
    permission_classes = []  # Empty list means no permission required
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['created_by', 'organization', 'category', 'difficulty', 'is_active']
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'category', 'difficulty', 'created_at']
    
    def get_queryset(self):
        """Filter tests by organization and skills."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by organization if user is not admin
        if not user.is_staff:
            queryset = queryset.filter(organization=user.organization)
        
        # Filter by skill if provided
        skill_id = self.request.query_params.get('skill_id')
        if skill_id:
            queryset = queryset.filter(skills__id=skill_id)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions for a test."""
        test = self.get_object()
        questions = Question.objects.filter(test=test)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    """ViewSet for the Question model."""
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    # For development purposes, allow unauthenticated access
    permission_classes = []  # Empty list means no permission required
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['test', 'question_type']
    search_fields = ['title', 'description']
    ordering_fields = ['order', 'points', 'created_at']
    
    def get_queryset(self):
        """Filter questions by test and skills."""
        queryset = super().get_queryset()
        
        # Filter by test if provided
        test_id = self.request.query_params.get('test_id')
        if test_id:
            queryset = queryset.filter(test_id=test_id)
        
        # Filter by skill if provided
        skill_id = self.request.query_params.get('skill_id')
        if skill_id:
            queryset = queryset.filter(skills__id=skill_id)
        
        return queryset
    
    @action(detail=False, methods=['post'], url_path='import_csv')
    def import_csv(self, request):
        """Import questions from a CSV file."""
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        test_id = request.data.get('testId')
        
        if not test_id:
            return Response({'error': 'Test ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Decode the file content
        content = file.read().decode('utf-8')
        csv_data = csv.DictReader(StringIO(content))
        
        questions_created = 0
        errors = []
        
        for row_num, row in enumerate(csv_data, start=2):  # Start from 2 to account for header row
            try:
                # Get the required fields
                content = row.get('content', '').strip()
                question_type = row.get('type', '').strip().lower()
                
                # Validate required fields
                if not content:
                    errors.append(f'Row {row_num}: Content is required')
                    continue
                
                if question_type not in ['mcq', 'coding', 'essay', 'file_upload']:
                    errors.append(f'Row {row_num}: Invalid question type. Must be one of: mcq, coding, essay, file_upload')
                    continue
                
                # Get optional fields with defaults
                points = int(row.get('points', 1))
                difficulty = row.get('difficulty', 'medium').strip().lower()
                
                # Validate difficulty
                if difficulty not in ['easy', 'medium', 'hard']:
                    difficulty = 'medium'
                
                # Get the current max order for questions in this test
                max_order = Question.objects.filter(test=test).aggregate(models.Max('order'))['order__max'] or 0
                
                # Create the question
                question = Question.objects.create(
                    test=test,
                    content=content,
                    question_type=question_type,
                    points=points,
                    difficulty=difficulty,
                    order=max_order + 1
                )
                
                # Handle answers for MCQ questions
                if question_type == 'mcq' and row.get('answers'):
                    try:
                        answers_data = json.loads(row.get('answers', '[]'))
                        for answer_data in answers_data:
                            question.answers.create(
                                content=answer_data.get('content', ''),
                                is_correct=answer_data.get('is_correct', False)
                            )
                    except json.JSONDecodeError:
                        errors.append(f'Row {row_num}: Invalid JSON format for answers')
                
                questions_created += 1
                
            except Exception as e:
                errors.append(f'Row {row_num}: {str(e)}')
        
        response_data = {
            'success': True,
            'questions_created': questions_created,
        }
        
        if errors:
            response_data['errors'] = errors
            
        return Response(response_data, status=status.HTTP_201_CREATED if questions_created > 0 else status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'], url_path='tests/(?P<test_id>[^/.]+)/export_questions')
    def export_questions(self, request, test_id=None):
        """Export questions for a test as CSV."""
        try:
            test = Test.objects.get(id=test_id)
        except Test.DoesNotExist:
            return Response({'error': 'Test not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all questions for the test
        questions = Question.objects.filter(test=test).order_by('order')
        
        # Create a CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{test.title}_questions.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['content', 'type', 'points', 'difficulty', 'answers'])
        
        for question in questions:
            # For MCQ questions, include the answers
            answers_json = '[]'
            if question.question_type == 'mcq':
                answers = question.answers.all()
                answers_data = [{'content': answer.content, 'is_correct': answer.is_correct} for answer in answers]
                answers_json = json.dumps(answers_data)
            
            writer.writerow([
                question.content,
                question.question_type,
                question.points,
                question.difficulty,
                answers_json
            ])
        
        return response


class CandidateAssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for the CandidateAssessment model."""
    queryset = CandidateAssessment.objects.all()
    serializer_class = CandidateAssessmentSerializer
    # Explicitly set permission_classes to AllowAny to disable authentication
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['candidate', 'assessment', 'status']
    search_fields = ['assessment__title', 'candidate__email']
    ordering_fields = ['start_time', 'end_time', 'score', 'created_at']
    
    def get_queryset(self):
        """Filter candidate assessments by user role."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # Skip filtering if user is not authenticated
        if not user.is_authenticated:
            return queryset
        
        # If user is a candidate, only show their assessments
        if not user.is_staff and user.role == 'candidate':
            queryset = queryset.filter(candidate=user)
        # If user is not admin, only show assessments from their organization
        elif not user.is_staff:
            queryset = queryset.filter(assessment__organization=user.organization)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def tests(self, request, pk=None):
        """Get tests for a candidate assessment."""
        candidate_assessment = self.get_object()
        candidate_tests = CandidateTest.objects.filter(candidate_assessment=candidate_assessment)
        serializer = CandidateTestSerializer(candidate_tests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def skill_scores(self, request, pk=None):
        """Get skill scores for a candidate assessment."""
        candidate_assessment = self.get_object()
        skill_scores = CandidateSkillScore.objects.filter(
            candidate=candidate_assessment.candidate,
            assessment=candidate_assessment.assessment
        )
        serializer = CandidateSkillScoreSerializer(skill_scores, many=True)
        return Response(serializer.data)


class CandidateTestViewSet(viewsets.ModelViewSet):
    """ViewSet for the CandidateTest model."""
    queryset = CandidateTest.objects.all()
    serializer_class = CandidateTestSerializer
    # For development purposes, allow unauthenticated access
    permission_classes = []  # Empty list means no permission required
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['candidate_assessment', 'test', 'status']
    ordering_fields = ['start_time', 'end_time', 'score', 'created_at']
    
    def get_queryset(self):
        """Filter candidate tests by candidate."""
        queryset = super().get_queryset()
        candidate = self.request.query_params.get('candidate', None)
        if candidate:
            queryset = queryset.filter(candidate_assessment__candidate=candidate)
        return queryset
    
    @action(detail=True, methods=['post'], url_path='answers')
    def submit_answer(self, request, pk=None):
        """Submit an answer for a question in this test."""
        candidate_test = self.get_object()
        
        # Check if the test is in progress
        if candidate_test.status != 'in_progress':
            return Response(
                {'error': 'Cannot submit answers for a test that is not in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get the question ID from the request data
        question_id = request.data.get('question_id')
        if not question_id:
            return Response(
                {'error': 'Question ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response(
                {'error': 'Question not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if the question belongs to the test
        if question.test.id != candidate_test.test.id:
            return Response(
                {'error': 'Question does not belong to this test'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create the candidate answer
        candidate_answer, created = CandidateAnswer.objects.get_or_create(
            candidate_test=candidate_test,
            question=question,
            defaults={
                'content': request.data.get('content', ''),
                'is_correct': False,
                'score': 0
            }
        )
        
        # Update the answer content
        candidate_answer.content = request.data.get('content', '')
        
        # For MCQ questions, check if the answer is correct
        if question.question_type == 'mcq':
            selected_answer_id = request.data.get('content')
            if selected_answer_id:
                try:
                    selected_answer = Answer.objects.get(id=selected_answer_id)
                    candidate_answer.is_correct = selected_answer.is_correct
                    candidate_answer.score = question.points if selected_answer.is_correct else 0
                except Answer.DoesNotExist:
                    candidate_answer.is_correct = False
                    candidate_answer.score = 0
        
        candidate_answer.save()
        
        return Response(
            CandidateAnswerSerializer(candidate_answer).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='answers')
    def get_answers(self, request, pk=None):
        """Get all answers for this candidate test."""
        candidate_test = self.get_object()
        answers = CandidateAnswer.objects.filter(candidate_test=candidate_test)
        return Response(CandidateAnswerSerializer(answers, many=True).data)
    
    @action(detail=True, methods=['post'], url_path='submit')
    def submit_test(self, request, pk=None):
        """Submit the test and calculate the score."""
        candidate_test = self.get_object()
        
        # Check if the test is in progress
        if candidate_test.status != 'in_progress':
            return Response(
                {'error': 'Cannot submit a test that is not in progress'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the test status and end time
        candidate_test.status = 'completed'
        candidate_test.end_time = timezone.now()
        
        # Calculate the score
        answers = CandidateAnswer.objects.filter(candidate_test=candidate_test)
        total_points = sum(answer.question.points for answer in answers)
        scored_points = sum(answer.score for answer in answers)
        
        if total_points > 0:
            candidate_test.score = (scored_points / total_points) * 100
        else:
            candidate_test.score = 0
        
        candidate_test.save()
        
        # Check if all tests in the assessment are completed
        assessment = candidate_test.candidate_assessment
        all_tests = CandidateTest.objects.filter(candidate_assessment=assessment)
        all_completed = all(test.status == 'completed' for test in all_tests)
        
        if all_completed:
            # Calculate the assessment score
            assessment.status = 'completed'
            assessment.end_time = timezone.now()
            
            total_test_scores = sum(test.score or 0 for test in all_tests)
            assessment.score = total_test_scores / all_tests.count() if all_tests.count() > 0 else 0
            
            assessment.save()
        
        return Response(CandidateTestSerializer(candidate_test).data)


class CandidateSkillScoreViewSet(viewsets.ModelViewSet):
    """ViewSet for the CandidateSkillScore model."""
    queryset = CandidateSkillScore.objects.all()
    serializer_class = CandidateSkillScoreSerializer
    # For development purposes, allow unauthenticated access
    permission_classes = []  # Empty list means no permission required
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['candidate', 'skill', 'assessment']
    ordering_fields = ['score', 'created_at']
    
    def get_queryset(self):
        """Filter skill scores by user role."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # If user is a candidate, only show their skill scores
        if not user.is_staff and user.role == 'candidate':
            queryset = queryset.filter(candidate=user)
        # If user is not admin, only show skill scores from their organization
        elif not user.is_staff:
            queryset = queryset.filter(assessment__organization=user.organization)
        
        return queryset 