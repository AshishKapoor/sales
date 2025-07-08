#!/usr/bin/env python
import os
import django
from django.conf import settings

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings.dev')
django.setup()

from django.db import connection

def check_tables():
    try:
        with connection.cursor() as cursor:
            # List all tables in the database
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            print("Tables in the database:")
            for table in tables:
                print(f"  - {table[0]}")
            
            # Check specifically for our core models
            core_models = ['core_user', 'core_account', 'core_contact', 'core_lead', 
                          'core_opportunity', 'core_task', 'core_interactionlog',
                          'core_product', 'core_quote', 'core_quotelineitem']
            
            print("\nCore model tables status:")
            for model in core_models:
                cursor.execute("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_schema = 'public' 
                        AND table_name = %s
                    );
                """, [model])
                exists = cursor.fetchone()[0]
                status = "✅" if exists else "❌"
                print(f"  {status} {model}")
                    
    except Exception as e:
        print(f"❌ Error checking tables: {e}")

if __name__ == "__main__":
    check_tables()
