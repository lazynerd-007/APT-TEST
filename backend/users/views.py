from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import User
from .serializers import UserSerializer
from .services import invite_candidates
from django.utils import timezone

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['post'])
    def invite_candidates(self, request):
        """
        Invite candidates to take an assessment.
        
        Request body:
        {
            "assessment_id": "123",
            "candidates": [
                {"name": "John Doe", "email": "john@example.com"},
                {"name": "Jane Smith", "email": "jane@example.com"}
            ],
            "message": "Optional custom message"
        }
        """
        assessment_id = request.data.get('assessment_id')
        candidates = request.data.get('candidates', [])
        message = request.data.get('message')
        
        if not assessment_id:
            return Response(
                {'error': 'Assessment ID is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not candidates:
            return Response(
                {'error': 'At least one candidate is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate candidate data
        for candidate in candidates:
            if not candidate.get('name') or not candidate.get('email'):
                return Response(
                    {'error': 'Each candidate must have a name and email'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Process invitations
        results = invite_candidates(
            candidates=candidates,
            assessment_id=assessment_id,
            custom_message=message
        )
        
        if 'error' in results:
            return Response(
                {'error': results['error']}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({
            'message': f"Successfully invited {len(results['success'])} candidates",
            'success_count': len(results['success']),
            'failed_count': len(results['failed']),
            'failed': results['failed']
        })
    
    @action(detail=False, methods=['post'])
    def verify_access_code(self, request):
        """
        Verify a candidate's access code.
        
        Request body:
        {
            "email": "candidate@example.com",
            "access_code": "ABC123"
        }
        """
        email = request.data.get('email')
        access_code = request.data.get('access_code')
        
        if not email or not access_code:
            return Response(
                {'error': 'Email and access code are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Find the user by email
            user = User.objects.get(email=email, is_candidate=True)
            
            # Check if the user has a candidate profile
            if not hasattr(user, 'candidate_profile'):
                return Response(
                    {'error': 'Invalid candidate account'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if the access code matches
            if user.candidate_profile.access_code != access_code:
                # Update login attempts
                user.candidate_profile.login_attempts += 1
                user.candidate_profile.last_login_attempt = timezone.now()
                user.candidate_profile.save()
                
                return Response(
                    {'error': 'Invalid access code'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Reset login attempts on successful verification
            user.candidate_profile.login_attempts = 0
            user.candidate_profile.save()
            
            # Return the user data and their assigned assessments
            from assessments.models import CandidateAssessment
            from assessments.serializers import CandidateAssessmentSerializer
            
            assessments = CandidateAssessment.objects.filter(candidate=user)
            serializer = CandidateAssessmentSerializer(assessments, many=True)
            
            return Response({
                'user_id': str(user.id),
                'email': user.email,
                'name': user.full_name,
                'assessments': serializer.data
            })
            
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or access code'}, 
                status=status.HTTP_400_BAD_REQUEST
            ) 