"""
Test organization validation and creation functionality
"""
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from core.models import Organization

User = get_user_model()


class OrganizationValidationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a user without organization
        self.user_no_org = User.objects.create_user(
            username='testuser@example.com',
            email='testuser@example.com',
            password='testpassword123',
            first_name='Test',
            last_name='User'
        )
        
        # Create an organization and user with organization
        self.organization = Organization.objects.create(
            name='Test Organization',
            description='Test Description'
        )
        
        self.user_with_org = User.objects.create_user(
            username='userwitorg@example.com',
            email='userwitorg@example.com',
            password='testpassword123',
            first_name='User',
            last_name='WithOrg',
            organization=self.organization
        )

    def test_user_without_organization_can_access_me_endpoint(self):
        """Test that user without organization can access /me/ endpoint"""
        self.client.force_authenticate(user=self.user_no_org)
        response = self.client.get('/api/v1/me/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data['organization'])
        self.assertEqual(response.data['email'], 'testuser@example.com')

    def test_user_with_organization_has_organization_data(self):
        """Test that user with organization returns organization data"""
        self.client.force_authenticate(user=self.user_with_org)
        response = self.client.get('/api/v1/me/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['organization'], self.organization.id)
        self.assertEqual(response.data['organization_name'], 'Test Organization')

    def test_user_without_organization_can_create_organization(self):
        """Test that user without organization can create one"""
        self.client.force_authenticate(user=self.user_no_org)
        
        data = {
            'name': 'New Organization',
            'description': 'A new organization created by user'
        }
        
        response = self.client.post('/api/v1/create-organization/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New Organization')
        
        # Check that user is now associated with the organization and is admin
        self.user_no_org.refresh_from_db()
        self.assertIsNotNone(self.user_no_org.organization)
        self.assertEqual(self.user_no_org.organization.name, 'New Organization')
        self.assertEqual(self.user_no_org.role, 'admin')

    def test_user_with_organization_cannot_create_another(self):
        """Test that user with organization cannot create another one"""
        self.client.force_authenticate(user=self.user_with_org)
        
        data = {
            'name': 'Another Organization',
            'description': 'Should not be created'
        }
        
        response = self.client.post('/api/v1/create-organization/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('already belong to an organization', response.data['error'])

    def test_create_organization_requires_name(self):
        """Test that creating organization requires a name"""
        self.client.force_authenticate(user=self.user_no_org)
        
        data = {
            'description': 'Organization without name'
        }
        
        response = self.client.post('/api/v1/create-organization/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Organization name is required', response.data['error'])

    def test_create_organization_with_existing_name_fails(self):
        """Test that creating organization with existing name fails"""
        self.client.force_authenticate(user=self.user_no_org)
        
        data = {
            'name': 'Test Organization',  # This already exists
            'description': 'Duplicate name'
        }
        
        response = self.client.post('/api/v1/create-organization/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('organization with this name already exists', response.data['error'])

    def test_unauthenticated_user_cannot_create_organization(self):
        """Test that unauthenticated user cannot create organization"""
        data = {
            'name': 'Unauthorized Organization',
            'description': 'Should not be created'
        }
        
        response = self.client.post('/api/v1/create-organization/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
