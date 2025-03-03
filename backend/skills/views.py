"""
API views for the skills app.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Skill, SkillCategory
from .serializers import SkillSerializer, SkillCategorySerializer


class SkillCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for skill categories.
    """
    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['get'])
    def skills(self, request, pk=None):
        """
        Get all skills for a specific category.
        """
        category = self.get_object()
        skills = Skill.objects.filter(category=category)
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    """
    API endpoint for skills.
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty']
    search_fields = ['name', 'description', 'tags']
    ordering_fields = ['name', 'difficulty', 'created_at']
    ordering = ['name']

    @action(detail=False, methods=['get'])
    def by_difficulty(self, request):
        """
        Get skills grouped by difficulty level.
        """
        difficulties = dict(Skill.DIFFICULTY_CHOICES)
        result = {}
        
        for difficulty_key in difficulties.keys():
            skills = Skill.objects.filter(difficulty=difficulty_key)
            serializer = SkillSerializer(skills, many=True)
            result[difficulty_key] = serializer.data
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def tags(self, request):
        """
        Get a list of all unique tags used across skills.
        """
        # This is a simplified approach - in production, you might want to use a more efficient query
        all_skills = Skill.objects.all()
        all_tags = set()
        
        for skill in all_skills:
            all_tags.update(skill.tags)
        
        return Response(sorted(list(all_tags))) 