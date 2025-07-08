from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Account, Lead, Opportunity, Task, InteractionLog,
    Cookbook, CookbookActivity, CookbookAssignment, ActivityProgress
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = [
            'id', 'name', 'industry', 'company_size', 
            'location', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'source',
            'status', 'assigned_to', 'assigned_to_name', 'account', 
            'account_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class OpportunitySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'title', 'account', 'account_name', 'contact_email',
            'amount', 'stage', 'expected_close_date', 'owner', 
            'owner_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'task_type', 'due_date', 'status',
            'lead', 'lead_name', 'opportunity', 'opportunity_title',
            'owner', 'owner_name', 'notes'
        ]
        read_only_fields = ['id']


class InteractionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    opportunity_title = serializers.CharField(source='opportunity.title', read_only=True)
    
    class Meta:
        model = InteractionLog
        fields = [
            'id', 'user', 'user_name', 'lead', 'lead_name',
            'opportunity', 'opportunity_title', 'type', 'summary', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class CookbookActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CookbookActivity
        fields = [
            'id', 'cookbook', 'title', 'description', 
            'frequency', 'target_count'
        ]
        read_only_fields = ['id']


class CookbookSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    activities = CookbookActivitySerializer(many=True, read_only=True)
    
    class Meta:
        model = Cookbook
        fields = [
            'id', 'title', 'description', 'created_by', 
            'created_by_name', 'created_at', 'activities'
        ]
        read_only_fields = ['id', 'created_at']


class CookbookAssignmentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    cookbook_title = serializers.CharField(source='cookbook.title', read_only=True)
    
    class Meta:
        model = CookbookAssignment
        fields = [
            'id', 'user', 'user_name', 'cookbook', 
            'cookbook_title', 'start_date'
        ]
        read_only_fields = ['id']


class ActivityProgressSerializer(serializers.ModelSerializer):
    activity_title = serializers.CharField(source='activity.title', read_only=True)
    user_name = serializers.CharField(source='assignment.user.get_full_name', read_only=True)
    
    class Meta:
        model = ActivityProgress
        fields = [
            'id', 'assignment', 'activity', 'activity_title',
            'user_name', 'date', 'count_done'
        ]
        read_only_fields = ['id']
