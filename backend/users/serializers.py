from rest_framework import serializers
from .models import User, CandidateProfile

class CandidateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = ['access_code', 'last_login_attempt', 'login_attempts']
        read_only_fields = ['last_login_attempt', 'login_attempts']

class UserSerializer(serializers.ModelSerializer):
    candidate_profile = CandidateProfileSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'first_name', 'last_name', 'name', 'is_active', 'is_staff', 'is_candidate', 'date_joined', 'candidate_profile', 'role']
        read_only_fields = ['date_joined']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def get_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        
        if password:
            user.set_password(password)
            user.save()
        
        return user 