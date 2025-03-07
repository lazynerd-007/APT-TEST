from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import User
from .serializers import UserSerializer
from .services import invite_candidates

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