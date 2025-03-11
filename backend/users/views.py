from rest_framework import viewsets, status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from .models import User, Role
from .serializers import UserSerializer
from .services import invite_candidates
from django.utils import timezone
import logging
import traceback

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
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
        try:
            logger.info(f"Received invite_candidates request: {request.data}")
            
            assessment_id = request.data.get('assessment_id')
            candidates = request.data.get('candidates', [])
            message = request.data.get('message')
            
            if not assessment_id:
                logger.warning("Missing assessment_id in request")
                return Response(
                    {'error': 'Assessment ID is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not candidates:
                logger.warning("No candidates provided in request")
                return Response(
                    {'error': 'At least one candidate is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate candidate data
            for candidate in candidates:
                if not candidate.get('name') or not candidate.get('email'):
                    logger.warning(f"Invalid candidate data: {candidate}")
                    return Response(
                        {'error': 'Each candidate must have a name and email'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # For debugging, let's return a success response without actually processing
            # This will help us determine if the issue is in the invite_candidates function
            # Comment this out after debugging
            # return Response({
            #     'message': f"Debug mode: Would invite {len(candidates)} candidates",
            #     'success_count': len(candidates),
            #     'failed_count': 0,
            #     'failed': []
            # })
            
            # Process invitations
            try:
                logger.info(f"Processing invitations for {len(candidates)} candidates")
                results = invite_candidates(
                    candidates=candidates,
                    assessment_id=assessment_id,
                    custom_message=message
                )
                
                if 'error' in results:
                    logger.error(f"Error in invite_candidates service: {results['error']}")
                    return Response(
                        {'error': results['error']}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                logger.info(f"Successfully invited {len(results['success'])} candidates")
                return Response({
                    'message': f"Successfully invited {len(results['success'])} candidates",
                    'success_count': len(results['success']),
                    'failed_count': len(results['failed']),
                    'failed': results['failed']
                })
            except Exception as e:
                logger.error(f"Exception in invite_candidates service: {str(e)}")
                logger.error(traceback.format_exc())
                return Response(
                    {'error': f"Internal server error: {str(e)}"}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except Exception as e:
            logger.error(f"Unhandled exception in invite_candidates view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def verify_access_code(self, request):
        """
        Verify a candidate's access code.
        
        Request body:
        {
            "email": "candidate@example.com",
            "access_code": "ABC123"
        }
        """
        try:
            logger.info(f"Received verify_access_code request: {request.data}")
            
            email = request.data.get('email')
            access_code = request.data.get('access_code')
            
            if not email or not access_code:
                logger.warning("Missing email or access_code in request")
                return Response(
                    {'error': 'Email and access code are required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            try:
                # Find the user by email
                user = User.objects.get(email=email, is_candidate=True)
                
                # Check if the user has a candidate profile
                if not hasattr(user, 'candidate_profile'):
                    logger.warning(f"User {email} does not have a candidate profile")
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
                    
                    logger.warning(f"Invalid access code for user {email}")
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
                
                logger.info(f"Successfully verified access code for user {email}")
                return Response({
                    'user_id': str(user.id),
                    'email': user.email,
                    'name': user.full_name,
                    'assessments': serializer.data
                })
                
            except User.DoesNotExist:
                logger.warning(f"User not found: {email}")
                return Response(
                    {'error': 'Invalid email or access code'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            logger.error(f"Unhandled exception in verify_access_code view: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': 'Internal server error'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def test_auth(self, request):
        """
        Test endpoint to verify authentication is working.
        """
        return Response({
            'message': 'Authentication successful',
            'user': {
                'id': request.user.id,
                'email': request.user.email,
                'is_staff': request.user.is_staff,
                'is_superuser': request.user.is_superuser
            }
        })
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_demo_user(self, request):
        """Create a demo user for testing purposes."""
        # Check if demo user already exists
        demo_email = 'demo.candidate@example.com'
        
        try:
            user = User.objects.get(email=demo_email)
            # If user exists, return it
            serializer = self.get_serializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            # Create a new demo user directly using the User model
            # Get or create the candidate role
            candidate_role, created = Role.objects.get_or_create(
                name='candidate',
                defaults={'permissions': {}}
            )
            
            # Create the user directly
            user = User.objects.create(
                email=demo_email,
                first_name='Demo',
                last_name='Candidate',
                role=candidate_role
            )
            
            # Set password
            user.set_password('demopassword')
            user.save()
            
            # Return the serialized user
            serializer = self.get_serializer(user)
            return Response(serializer.data, status=status.HTTP_201_CREATED) 