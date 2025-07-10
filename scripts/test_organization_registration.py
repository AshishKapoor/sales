#!/usr/bin/env python3
"""
Test script to verify organization creation during registration works correctly.
Run with: python manage.py shell < test_organization_registration.py
"""

from core.models import User, Organization
from core.serializers import UserRegistrationSerializer


def test_registration_with_organization():
    """Test user registration with organization creation"""
    
    print("Testing organization creation during registration...")
    
    # Clean up any existing test data
    test_email = "test_org_admin@example.com"
    test_org_name = "Test Organization Ltd"
    
    User.objects.filter(email=test_email).delete()
    Organization.objects.filter(name=test_org_name).delete()
    
    # Test data
    registration_data = {
        "email": test_email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "Admin",
        "create_organization": True,
        "organization_name": test_org_name,
        "organization_description": "A test organization for verification"
    }
    
    # Test serializer
    serializer = UserRegistrationSerializer(data=registration_data)
    
    if serializer.is_valid():
        user = serializer.save()
        print("✅ Registration successful!")
        print(f"   User ID: {user.id}")
        print(f"✅ User created: {user.get_full_name()}")
        print(f"   Role: {user.role}")
        print(f"   Organization: {user.organization.name if user.organization else 'None'}")
        
        # Verify organization was created
        if user.organization:
            org = user.organization
            print(f"✅ Organization created: {org.name}")
            print(f"   Description: {org.description}")
            print(f"   Users count: {org.users.count()}")
            
            # Verify user is admin
            if user.role == 'admin':
                print("✅ User correctly assigned admin role")
            else:
                print(f"❌ User role should be 'admin' but is '{user.role}'")
        else:
            print("❌ Organization not created")
    else:
        print(f"❌ Registration failed: {serializer.errors}")
    
    # Clean up test data
    User.objects.filter(email=test_email).delete()
    Organization.objects.filter(name=test_org_name).delete()


def test_registration_without_organization():
    """Test user registration without organization creation"""
    
    print("\nTesting normal registration without organization...")
    
    test_email = "test_user@example.com"
    User.objects.filter(email=test_email).delete()
    
    registration_data = {
        "email": test_email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "User",
        "create_organization": False
    }
    
    serializer = UserRegistrationSerializer(data=registration_data)
    
    if serializer.is_valid():
        user = serializer.save()
        print("✅ Registration successful!")
        print(f"✅ User created: {user.get_full_name()}")
        print(f"   Role: {user.role}")
        print(f"   Organization: {user.organization.name if user.organization else 'None'}")
        
        # Verify user has no organization and is sales_rep
        if user.organization is None:
            print("✅ User correctly has no organization")
        else:
            print(f"❌ User should have no organization but has '{user.organization.name}'")
            
        if user.role == 'sales_rep':
            print("✅ User correctly assigned sales_rep role")
        else:
            print(f"❌ User role should be 'sales_rep' but is '{user.role}'")
    else:
        print(f"❌ Registration failed: {serializer.errors}")
    
    # Clean up test data
    User.objects.filter(email=test_email).delete()


def test_duplicate_organization_name():
    """Test that duplicate organization names are rejected"""
    
    print("\nTesting duplicate organization name validation...")
    
    # Create an organization first
    existing_org = Organization.objects.create(
        name="Existing Company", 
        description="Already exists"
    )
    
    test_email = "test_duplicate@example.com"
    User.objects.filter(email=test_email).delete()
    
    registration_data = {
        "email": test_email,
        "password": "SecurePassword123!",
        "confirm_password": "SecurePassword123!",
        "first_name": "Test",
        "last_name": "User",
        "create_organization": True,
        "organization_name": "Existing Company",  # Duplicate name
        "organization_description": "This should fail"
    }
    
    serializer = UserRegistrationSerializer(data=registration_data)
    
    if not serializer.is_valid():
        if 'organization_name' in serializer.errors:
            print("✅ Duplicate organization name correctly rejected")
            print(f"   Error: {serializer.errors['organization_name'][0]}")
        else:
            print(f"❌ Expected organization_name error but got: {serializer.errors}")
    else:
        print("❌ Duplicate organization name should have been rejected")
    
    # Clean up test data
    User.objects.filter(email=test_email).delete()
    existing_org.delete()


if __name__ == "__main__":
    print("Organization Registration Test Script")
    print("=" * 50)
    
    test_registration_with_organization()
    test_registration_without_organization()
    test_duplicate_organization_name()
    
    print("\nTest completed! 🎉")
