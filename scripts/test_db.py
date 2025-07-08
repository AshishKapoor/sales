#!/usr/bin/env python
import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings.dev')
django.setup()

from django.db import connection

def test_database_connection():
    try:
        with connection.cursor() as cursor:
            # Test basic connection
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            print(f"✅ Database connection successful!")
            print(f"PostgreSQL version: {version[0]}")
            
            # Check current database and schema
            cursor.execute("SELECT current_database(), current_schema();")
            db_info = cursor.fetchone()
            print(f"Current database: {db_info[0]}")
            print(f"Current schema: {db_info[1]}")
            
            # Check available schemas
            cursor.execute("SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;")
            schemas = cursor.fetchall()
            print(f"Available schemas: {[s[0] for s in schemas]}")
            
            # Check if public schema exists and has proper permissions
            cursor.execute("""
                SELECT has_schema_privilege(current_user, 'public', 'CREATE');
            """)
            can_create = cursor.fetchone()[0]
            print(f"Can create in public schema: {can_create}")
            
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    test_database_connection()
