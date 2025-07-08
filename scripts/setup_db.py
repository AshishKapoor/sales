#!/usr/bin/env python
import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings.dev')
django.setup()

from django.db import connection

def setup_database():
    try:
        with connection.cursor() as cursor:
            print("Setting up database schema...")
            
            # Create the public schema
            cursor.execute("CREATE SCHEMA IF NOT EXISTS public;")
            print("✅ Created/verified public schema")
            
            # Grant privileges to the current user on the public schema
            cursor.execute(f"GRANT ALL PRIVILEGES ON SCHEMA public TO {connection.settings_dict['USER']};")
            print(f"✅ Granted privileges to user {connection.settings_dict['USER']}")
            
            # Set the search path to include public schema
            cursor.execute("ALTER DATABASE postgres SET search_path TO public;")
            print("✅ Set search path to public schema")
            
            # Grant usage and create privileges
            cursor.execute(f"GRANT USAGE, CREATE ON SCHEMA public TO {connection.settings_dict['USER']};")
            print("✅ Granted usage and create privileges")
            
            # Verify the setup
            cursor.execute("SELECT current_schema();")
            current_schema = cursor.fetchone()[0]
            print(f"Current schema: {current_schema}")
            
            cursor.execute("""
                SELECT has_schema_privilege(current_user, 'public', 'CREATE');
            """)
            can_create = cursor.fetchone()[0]
            print(f"Can create in public schema: {can_create}")
            
            print("✅ Database setup completed successfully!")
            return True
            
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False

if __name__ == "__main__":
    setup_database()
