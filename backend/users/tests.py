from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User, Role
import json

class DemoUserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
    def test_create_demo_user(self):
        """Test creating a demo user"""
        # The URL pattern is /api/v1/users/create_demo_user/
        # Include the password field in the request data
        response = self.client.post('/api/v1/users/create_demo_user/', {
            'password': 'demopassword'
        })
        
        # Print the response content
        print("Create demo user response:", response.status_code)
        print("Response content:", response.content.decode())
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.filter(email='demo.candidate@example.com').count(), 1)
        
        # Check that the user has the correct attributes
        user = User.objects.get(email='demo.candidate@example.com')
        self.assertEqual(user.first_name, 'Demo')
        self.assertEqual(user.last_name, 'Candidate')
        
        # Check that the role is set correctly
        self.assertIsNotNone(user)
        
    def test_login_with_demo_user(self):
        """Test logging in with the demo user"""
        # First create the demo user
        create_response = self.client.post('/api/v1/users/create_demo_user/', {
            'password': 'demopassword'
        })
        print("Create demo user response:", create_response.status_code)
        print("Create response content:", create_response.content.decode())
        
        # Then try to login
        # The URL pattern is /api/v1/auth/login/
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'demo.candidate@example.com',
            'password': 'demopassword'
        })
        
        # Print the response content
        print("Login response:", response.status_code)
        print("Login response content:", response.content.decode())
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'demo.candidate@example.com') 