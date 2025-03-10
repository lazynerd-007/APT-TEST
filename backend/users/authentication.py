from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.conf import settings
import logging
import uuid
from .models import Organization, Role

User = get_user_model()
logger = logging.getLogger(__name__)

# Hardcoded UUIDs for development
DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
DEMO_ORGANIZATION_ID = '00000000-0000-0000-0000-000000000002'

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
            
        # Ensure demo user and organization exist
        self.ensure_demo_entities_exist()
            
        # For development purposes, accept any token and return the demo user
        try:
            # Try to get the demo user
            user = User.objects.filter(id=DEMO_USER_ID).first()
            if not user:
                # If demo user doesn't exist, get any admin user
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
    
    def ensure_demo_entities_exist(self):
        """
        Ensure that demo user and organization exist in the database.
        This is for development purposes only.
        """
        try:
            # Ensure demo organization exists
            org, org_created = Organization.objects.get_or_create(
                id=uuid.UUID(DEMO_ORGANIZATION_ID),
                defaults={
                    'name': 'Demo Organization',
                    'description': 'This is a demo organization for development purposes.'
                }
            )
            if org_created:
                logger.debug(f"Created demo organization with ID: {DEMO_ORGANIZATION_ID}")
            
            # Ensure admin role exists
            role, role_created = Role.objects.get_or_create(
                name='admin',
                defaults={
                    'permissions': {'admin': True}
                }
            )
            if role_created:
                logger.debug("Created admin role")
            
            # Ensure demo user exists
            user, user_created = User.objects.get_or_create(
                id=uuid.UUID(DEMO_USER_ID),
                defaults={
                    'email': 'demo@example.com',
                    'first_name': 'Demo',
                    'last_name': 'User',
                    'is_staff': True,
                    'is_superuser': True,
                    'organization': org,
                    'role': role
                }
            )
            if user_created:
                user.set_password('demo123')
                user.save()
                logger.debug(f"Created demo user with ID: {DEMO_USER_ID}")
                
        except Exception as e:
            logger.error(f"Error ensuring demo entities exist: {str(e)}") 