import os
import sys
import django
import uuid

# Add the project directory to the Python path
sys.path.insert(0, os.path.abspath('backend'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluapt.settings')
django.setup()

# Import Django models
from django.contrib.auth import get_user_model
from users.models import Organization, Role
from django.db import transaction

User = get_user_model()

# Test user credentials
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "password123"
ADMIN_FIRST_NAME = "Admin"
ADMIN_LAST_NAME = "User"

CANDIDATE_EMAIL = "candidate@example.com"
CANDIDATE_PASSWORD = "password123"
CANDIDATE_FIRST_NAME = "Test"
CANDIDATE_LAST_NAME = "Candidate"

def create_organization():
    """Create a test organization if it doesn't exist"""
    org, created = Organization.objects.get_or_create(
        name="Test Organization",
        defaults={
            "description": "Organization for testing purposes"
        }
    )
    
    if created:
        print(f"Created organization: {org.name}")
    else:
        print(f"Organization already exists: {org.name}")
    
    return org

def create_roles():
    """Create admin and candidate roles if they don't exist"""
    admin_role, admin_created = Role.objects.get_or_create(
        name="admin",
        defaults={
            "permissions": {"can_manage_users": True, "can_manage_assessments": True}
        }
    )
    
    candidate_role, candidate_created = Role.objects.get_or_create(
        name="candidate",
        defaults={
            "permissions": {"can_take_assessments": True}
        }
    )
    
    if admin_created:
        print("Created admin role")
    else:
        print("Admin role already exists")
        
    if candidate_created:
        print("Created candidate role")
    else:
        print("Candidate role already exists")
        
    return admin_role, candidate_role

def create_admin_user(organization, admin_role):
    """Create an admin user if it doesn't exist"""
    try:
        admin = User.objects.get(email=ADMIN_EMAIL)
        print(f"Admin user already exists: {admin.email}")
    except User.DoesNotExist:
        with transaction.atomic():
            admin = User.objects.create_user(
                email=ADMIN_EMAIL,
                password=ADMIN_PASSWORD,
                first_name=ADMIN_FIRST_NAME,
                last_name=ADMIN_LAST_NAME,
                is_active=True,
                is_staff=True,
                is_superuser=True,
                role=admin_role,
                organization=organization
            )
            
            print(f"Created admin user: {admin.email}")
    
    return admin

def create_candidate_user(candidate_role):
    """Create a candidate user if it doesn't exist"""
    try:
        candidate = User.objects.get(email=CANDIDATE_EMAIL)
        print(f"Candidate user already exists: {candidate.email}")
    except User.DoesNotExist:
        with transaction.atomic():
            candidate = User.objects.create_user(
                email=CANDIDATE_EMAIL,
                password=CANDIDATE_PASSWORD,
                first_name=CANDIDATE_FIRST_NAME,
                last_name=CANDIDATE_LAST_NAME,
                is_active=True,
                is_staff=False,
                is_superuser=False,
                role=candidate_role,
                organization=None
            )
            
            print(f"Created candidate user: {candidate.email}")
    
    return candidate

def main():
    """Set up test users for the application"""
    print("Setting up test users...")
    
    # Create organization
    organization = create_organization()
    
    # Create roles
    admin_role, candidate_role = create_roles()
    
    # Create admin user
    admin = create_admin_user(organization, admin_role)
    
    # Create candidate user
    candidate = create_candidate_user(candidate_role)
    
    print("\nTest users setup completed!")
    print(f"Admin: {admin.email} (password: {ADMIN_PASSWORD})")
    print(f"Candidate: {candidate.email} (password: {CANDIDATE_PASSWORD})")

if __name__ == "__main__":
    main() 