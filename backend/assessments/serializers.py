"""
Serializers for the assessments app.
"""
from rest_framework import serializers
from .models import (
    Assessment, 
    AssessmentSkill,
    Test, 
    AssessmentTest, 
    Question,
    Answer,
    CandidateAssessment,
    CandidateTest,
    CandidateSkillScore,
    CandidateAnswer
)
from skills.serializers import SkillSerializer
from skills.models import Skill


class AssessmentSkillSerializer(serializers.ModelSerializer):
    """Serializer for the AssessmentSkill model."""
    skill_details = SkillSerializer(source='skill', read_only=True)
    
    class Meta:
        model = AssessmentSkill
        fields = [
            'id', 
            'assessment', 
            'skill', 
            'skill_details',
            'importance', 
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TestSerializer(serializers.ModelSerializer):
    """Serializer for the Test model."""
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        source='skills',
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Test
        fields = [
            'id', 
            'title', 
            'description', 
            'instructions',
            'time_limit', 
            'category', 
            'difficulty',
            'created_by', 
            'organization',
            'skills',
            'skill_ids',
            'is_active', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        skills = validated_data.pop('skills', [])
        test = Test.objects.create(**validated_data)
        if skills:
            test.skills.set(skills)
        return test
    
    def update(self, instance, validated_data):
        skills = validated_data.pop('skills', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if skills is not None:
            instance.skills.set(skills)
        
        return instance


class AssessmentTestSerializer(serializers.ModelSerializer):
    """Serializer for the AssessmentTest model."""
    test_details = TestSerializer(source='test', read_only=True)
    
    class Meta:
        model = AssessmentTest
        fields = [
            'id', 
            'assessment', 
            'test', 
            'test_details',
            'weight', 
            'order', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for the Question model."""
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        source='skills',
        queryset=Skill.objects.all(),
        many=True,
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Question
        fields = [
            'id', 
            'test', 
            'content',
            'type',
            'difficulty',
            'points',
            'skills',
            'skill_ids',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        skills = validated_data.pop('skills', [])
        question = Question.objects.create(**validated_data)
        if skills:
            question.skills.set(skills)
        return question
    
    def update(self, instance, validated_data):
        skills = validated_data.pop('skills', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if skills is not None:
            instance.skills.set(skills)
        
        return instance


class AssessmentSerializer(serializers.ModelSerializer):
    """Serializer for the Assessment model."""
    assessment_tests = AssessmentTestSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    assessment_skills = AssessmentSkillSerializer(
        source='assessmentskill_set',
        many=True,
        read_only=True
    )
    
    class Meta:
        model = Assessment
        fields = [
            'id', 
            'title', 
            'description', 
            'time_limit',
            'passing_score', 
            'created_by', 
            'organization',
            'skills',
            'assessment_skills',
            'assessment_tests',
            'is_active', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AssessmentCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating assessments with skills."""
    skill_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    test_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Assessment
        fields = [
            'id', 
            'title', 
            'description', 
            'time_limit',
            'passing_score', 
            'created_by', 
            'organization',
            'skill_data',
            'test_data',
            'is_active'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        skill_data = validated_data.pop('skill_data', [])
        test_data = validated_data.pop('test_data', [])
        
        assessment = Assessment.objects.create(**validated_data)
        
        # Process skills
        for skill_item in skill_data:
            AssessmentSkill.objects.create(
                assessment=assessment,
                skill_id=skill_item['skill_id'],
                importance=skill_item.get('importance', 'secondary')
            )
        
        # Process tests
        for idx, test_item in enumerate(test_data):
            AssessmentTest.objects.create(
                assessment=assessment,
                test_id=test_item['test_id'],
                weight=test_item.get('weight', 1),
                order=test_item.get('order', idx + 1)
            )
        
        return assessment
    
    def update(self, instance, validated_data):
        skill_data = validated_data.pop('skill_data', None)
        test_data = validated_data.pop('test_data', None)
        
        # Update assessment fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update skills if provided
        if skill_data is not None:
            # Remove existing skills
            AssessmentSkill.objects.filter(assessment=instance).delete()
            
            # Add new skills
            for skill_item in skill_data:
                AssessmentSkill.objects.create(
                    assessment=instance,
                    skill_id=skill_item['skill_id'],
                    importance=skill_item.get('importance', 'secondary')
                )
        
        # Update tests if provided
        if test_data is not None:
            # Remove existing tests
            AssessmentTest.objects.filter(assessment=instance).delete()
            
            # Add new tests
            for idx, test_item in enumerate(test_data):
                AssessmentTest.objects.create(
                    assessment=instance,
                    test_id=test_item['test_id'],
                    weight=test_item.get('weight', 1),
                    order=test_item.get('order', idx + 1)
                )
        
        return instance


class CandidateTestSerializer(serializers.ModelSerializer):
    """Serializer for the CandidateTest model."""
    test_details = TestSerializer(source='test', read_only=True)
    
    class Meta:
        model = CandidateTest
        fields = [
            'id', 
            'candidate_assessment', 
            'test', 
            'test_details',
            'status', 
            'score', 
            'start_time', 
            'end_time',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CandidateAssessmentSerializer(serializers.ModelSerializer):
    """Serializer for the CandidateAssessment model."""
    assessment_details = AssessmentSerializer(source='assessment', read_only=True)
    candidate_tests = CandidateTestSerializer(many=True, read_only=True)
    
    class Meta:
        model = CandidateAssessment
        fields = [
            'id', 
            'candidate', 
            'assessment', 
            'assessment_details',
            'status', 
            'score', 
            'start_time', 
            'end_time',
            'candidate_tests',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CandidateSkillScoreSerializer(serializers.ModelSerializer):
    """Serializer for the CandidateSkillScore model."""
    skill_details = SkillSerializer(source='skill', read_only=True)
    
    class Meta:
        model = CandidateSkillScore
        fields = [
            'id', 
            'candidate', 
            'skill', 
            'skill_details',
            'assessment', 
            'score', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for the Answer model."""
    
    class Meta:
        model = Answer
        fields = [
            'id',
            'question',
            'content',
            'is_correct',
            'explanation',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CandidateAnswerSerializer(serializers.ModelSerializer):
    """Serializer for the CandidateAnswer model."""
    question_details = QuestionSerializer(source='question', read_only=True)
    
    class Meta:
        model = CandidateAnswer
        fields = [
            'id',
            'candidate_test',
            'question',
            'question_details',
            'content',
            'is_correct',
            'score',
            'feedback',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 