#!/usr/bin/env python
"""
Script to create an admin superuser for the Django application.
Usage: python scripts/create_admin.py
"""
import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings.dev')
django.setup()

from django.contrib.auth import get_user_model

def create_admin_user():
    """Create a superuser with predefined credentials."""
    User = get_user_model()
    
    username = 'admin'
    email = 'admin@example.com'
    password = 'rgcmusic'
    
    try:
        # Check if user already exists
        if User.objects.filter(username=username).exists():
            print(f"⚠️  User '{username}' already exists!")
            user = User.objects.get(username=username)
            print(f"   Email: {user.email}")
            print(f"   Is superuser: {user.is_superuser}")
            print(f"   Is staff: {user.is_staff}")
            print(f"   Role: {user.role}")
            return user
        
        # Create the superuser
        print(f"Creating superuser '{username}'...")
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        
        # Set the role to admin
        user.role = 'admin'
        user.save()
        
        print("✅ Superuser created successfully!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Role: {user.role}")
        print("")
        print("You can now log in to:")
        print("   - Django Admin: http://localhost:8000/admin/")
        print("   - API Docs: http://localhost:8000/api/docs/")
        
        return user
        
    except Exception as e:
        print(f"❌ Failed to create superuser: {e}")
        return None

if __name__ == "__main__":
    create_admin_user()
