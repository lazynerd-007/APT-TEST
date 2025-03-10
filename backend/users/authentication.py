from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class DevelopmentAuthentication(BaseAuthentication):
    """
    Custom authentication class for development that accepts any token.
    This should ONLY be used in development environments.
    """
    
    def authenticate(self, request):
        # Get the token from the Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        logger.debug(f"Auth header: {auth_header}")
        
        if not auth_header:
            logger.debug("No Authorization header found")
            return None
            
        # Accept both 'Token' and 'Bearer' prefixes for flexibility
        if auth_header.startswith('Token '):
            token = auth_header.split(' ')[1]
        elif auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
        else:
            # Try to extract token without prefix
            token = auth_header
            
        logger.debug(f"Extracted token: {token}")
        
        if not token:
            logger.debug("No token found in Authorization header")
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
                logger.error("No users found in the system")
                raise AuthenticationFailed('No users found in the system')
                
            logger.debug(f"Authenticated as user: {user.email}")
            return (user, token)
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise AuthenticationFailed(f'Authentication failed: {str(e)}')
    
    def authenticate_header(self, request):
        return 'Token' 