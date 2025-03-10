"""
Views for the assessments app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    Assessment, 
    AssessmentSkill,
    Test, 
    AssessmentTest, 
    Question,
    CandidateAssessment,
    CandidateTest,
    CandidateSkillScore
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
    CandidateSkillScoreSerializer
)
from skills.models import Skill


class AssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for the Assessment model."""
    queryset = Assessment.objects.all()
    # For development purposes, allow unauthenticated access
    permission_classes = []  # Empty list means no permission required
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


class CandidateAssessmentViewSet(viewsets.ModelViewSet):
    """ViewSet for the CandidateAssessment model."""
    queryset = CandidateAssessment.objects.all()
    serializer_class = CandidateAssessmentSerializer
    # For development purposes, allow unauthenticated access
    permission_classes = []  # Empty list means no permission required
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['candidate', 'assessment', 'status']
    search_fields = ['assessment__title', 'candidate__email']
    ordering_fields = ['start_time', 'end_time', 'score', 'created_at']
    
    def get_queryset(self):
        """Filter candidate assessments by user role."""
        queryset = super().get_queryset()
        user = self.request.user
        
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
        """Filter candidate tests by user role."""
        queryset = super().get_queryset()
        user = self.request.user
        
        # If user is a candidate, only show their tests
        if not user.is_staff and user.role == 'candidate':
            queryset = queryset.filter(candidate_assessment__candidate=user)
        # If user is not admin, only show tests from their organization
        elif not user.is_staff:
            queryset = queryset.filter(
                candidate_assessment__assessment__organization=user.organization
            )
        
        return queryset


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