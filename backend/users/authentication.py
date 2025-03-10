from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class DevelopmentAuthentication(BaseAuthentication):
    """
    Custom authentication class for development that accepts any token.
    This should ONLY be used in development environments.
    """
    
    def authenticate(self, request):
        # Get the token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        if not auth_header.startswith('Token '):
            return None
        
        # Extract the token
        token = auth_header.split(' ')[1]
        
        if not token:
            return None
            
        # For development purposes, accept any token and return the first admin user
        # In production, this would validate the token against the database
        try:
            # Try to get an admin user first
            user = User.objects.filter(is_staff=True).first()
            if not user:
                # If no admin user exists, get any user
                user = User.objects.first()
            if not user:
                # If no user exists, raise an error
                raise AuthenticationFailed('No users found in the system')
                
            return (user, token)
        except Exception as e:
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Token' 