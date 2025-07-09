#!/usr/bin/env python3
"""
Test script for InteractionLog signals.

This script demonstrates how the InteractionLog entries are automatically 
generated through Django signals for various sales activities.
"""

import os
import sys
import django

# Add the project root to the Python path
sys.path.append('/Users/ashish/Developer/sannty/sales-cookbook')

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings.dev')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Lead, Account, Contact, Opportunity, InteractionLog, Task
from core.signals import create_task_completion_log, create_manual_interaction_log

User = get_user_model()

def test_interaction_logs():
    """Test the automatic InteractionLog generation."""
    
    print("🚀 Testing InteractionLog Signal Generation")
    print("=" * 50)
    
    # Create a test user if it doesn't exist
    user, created = User.objects.get_or_create(
        username='test_sales_rep',
        defaults={
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'role': 'sales_rep'
        }
    )
    
    if created:
        print(f"✅ Created test user: {user}")
    else:
        print(f"📝 Using existing test user: {user}")
    
    # Test 1: Lead Creation
    print("\n1️⃣ Testing Lead Creation Signal")
    lead = Lead.objects.create(
        name="John Doe",
        email="john.doe@testcompany.com",
        company="Test Company Inc",
        assigned_to=user
    )
    lead._created_by = user  # Simulate the view setting this
    lead.save()
    
    logs = InteractionLog.objects.filter(lead=lead)
    print(f"   Created lead: {lead}")
    print(f"   Generated {logs.count()} interaction log(s)")
    if logs.exists():
        print(f"   📋 Log: {logs.first().summary}")
    
    # Test 2: Lead Status Change
    print("\n2️⃣ Testing Lead Status Change Signal")
    old_count = InteractionLog.objects.filter(lead=lead).count()
    lead.status = 'contacted'
    lead.save()
    
    new_count = InteractionLog.objects.filter(lead=lead).count()
    if new_count > old_count:
        latest_log = InteractionLog.objects.filter(lead=lead).latest('timestamp')
        print(f"   Changed lead status to: {lead.get_status_display()}")
        print(f"   📋 Log: {latest_log.summary}")
    
    # Test 3: Lead to Opportunity Conversion
    print("\n3️⃣ Testing Lead Conversion")
    lead.status = 'qualified'
    lead.save()
    
    # Create account and contact for opportunity
    account, _ = Account.objects.get_or_create(
        name="Test Company Inc",
        defaults={'industry': 'Technology'}
    )
    
    contact, _ = Contact.objects.get_or_create(
        email=lead.email,
        defaults={
            'name': lead.name,
            'phone': lead.phone,
            'account': account
        }
    )
    
    opportunity = Opportunity.objects.create(
        name=f"Opportunity for {lead.name}",
        account=account,
        contact=contact,
        amount=50000,
        owner=user
    )
    
    lead.status = 'converted'
    lead.save()
    
    opp_logs = InteractionLog.objects.filter(opportunity=opportunity)
    print(f"   Created opportunity: {opportunity}")
    print(f"   Generated {opp_logs.count()} interaction log(s)")
    if opp_logs.exists():
        print(f"   📋 Log: {opp_logs.first().summary}")
    
    # Test 4: Opportunity Stage Change
    print("\n4️⃣ Testing Opportunity Stage Change")
    old_count = InteractionLog.objects.filter(opportunity=opportunity).count()
    opportunity.stage = 'proposal'
    opportunity.save()
    
    new_count = InteractionLog.objects.filter(opportunity=opportunity).count()
    if new_count > old_count:
        latest_log = InteractionLog.objects.filter(opportunity=opportunity).latest('timestamp')
        print(f"   Changed opportunity stage to: {opportunity.get_stage_display()}")
        print(f"   📋 Log: {latest_log.summary}")
    
    # Test 5: Manual Task Completion
    print("\n5️⃣ Testing Task Completion")
    task = Task.objects.create(
        title="Follow up call",
        type="call",
        due_date="2025-07-15",
        related_lead=lead,
        owner=user,
        notes="Discussed pricing options"
    )
    
    # Simulate task completion (this would normally be done in the view)
    task.status = 'completed'
    task.save()
    create_task_completion_log(task, user)
    
    task_logs = InteractionLog.objects.filter(lead=lead, type='call')
    if task_logs.exists():
        print(f"   Completed task: {task}")
        print(f"   📋 Log: {task_logs.latest('timestamp').summary}")
    
    # Test 6: Manual Interaction Log
    print("\n6️⃣ Testing Manual Interaction Log")
    create_manual_interaction_log(
        user=user,
        interaction_type='email',
        summary="Sent product brochure and pricing information",
        lead=lead
    )
    
    manual_logs = InteractionLog.objects.filter(lead=lead, type='email')
    if manual_logs.exists():
        print(f"   📋 Manual Log: {manual_logs.latest('timestamp').summary}")
    
    # Summary
    print("\n📊 SUMMARY")
    print("=" * 50)
    total_logs = InteractionLog.objects.filter(user=user).count()
    print(f"Total InteractionLogs generated: {total_logs}")
    
    print("\nAll logs for this test session:")
    for log in InteractionLog.objects.filter(user=user).order_by('timestamp'):
        target = log.lead or log.contact or log.opportunity or "Unknown"
        print(f"   🔸 {log.get_type_display()}: {log.summary[:60]}...")
    
    print("\n✅ InteractionLog signal testing completed!")

if __name__ == "__main__":
    test_interaction_logs()
