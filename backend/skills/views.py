"""
API views for the skills app.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
import logging
from .models import Skill, SkillCategory
from .serializers import SkillSerializer, SkillCategorySerializer

logger = logging.getLogger(__name__)

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

    def list(self, request, *args, **kwargs):
        """List all skill categories with better error handling."""
        try:
            logger.info("Listing all skill categories")
            queryset = self.filter_queryset(self.get_queryset())
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Found {len(serializer.data)} categories")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error listing categories: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        """Create a new skill category with better error handling."""
        try:
            logger.info(f"Creating category with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Category created successfully: {serializer.data}")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error(f"Error creating category: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """Update a skill category with better error handling."""
        try:
            logger.info(f"Updating category {kwargs.get('pk')} with data: {request.data}")
            instance = self.get_object()
            serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            logger.info(f"Category updated successfully: {serializer.data}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating category: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

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