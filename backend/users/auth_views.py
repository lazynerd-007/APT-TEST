from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.conf import settings
from .models import User
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint that returns a token for authenticated users.
    
    Request body:
    {
        "email": "user@example.com",
        "password": "password"
    }
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    logger.debug(f"Login attempt for email: {email}")
    
    if not email or not password:
        logger.debug("Email or password missing")
        return Response(
            {'error': 'Email and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user exists
    try:
        user_exists = User.objects.filter(email=email).exists()
        logger.debug(f"User exists: {user_exists}")
    except Exception as e:
        logger.error(f"Error checking if user exists: {str(e)}")
    
    # Authenticate user
    user = authenticate(username=email, password=password)
    
    if not user:
        logger.debug(f"Authentication failed for email: {email}")
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    logger.debug(f"Authentication successful for user: {user.email}")
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    # Return token and user info
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': f"{user.first_name} {user.last_name}".strip(),
            'role': 'admin' if user.is_staff else 'employer' if hasattr(user, 'employer_profile') else 'candidate'
        }
    }) 