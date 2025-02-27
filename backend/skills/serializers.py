"""
Serializers for the skills app.
"""
from rest_framework import serializers
from .models import Skill, SkillCategory


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
            'difficulty', 'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_tags(self, value):
        """Validate that tags are properly formatted."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Tags must be a list of strings")
        
        # Ensure all tags are strings and not empty
        for tag in value:
            if not isinstance(tag, str) or not tag.strip():
                raise serializers.ValidationError("All tags must be non-empty strings")
        
        # Remove duplicates and whitespace
        cleaned_tags = list(set([tag.strip().lower() for tag in value if tag.strip()]))
        
        return cleaned_tags 