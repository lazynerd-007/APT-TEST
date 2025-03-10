"""
Serializers for the skills app.
"""
from rest_framework import serializers
import logging
from .models import Skill, SkillCategory

logger = logging.getLogger(__name__)

class SkillCategorySerializer(serializers.ModelSerializer):
    """Serializer for skill categories."""
    
    class Meta:
        model = SkillCategory
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SkillSerializer(serializers.ModelSerializer):
    """Serializer for skills."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Skill
        fields = [
            'id', 'name', 'description', 'category', 'category_name',
            'difficulty', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 