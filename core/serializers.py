from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Account, Lead, Contact, Opportunity, Task, InteractionLog,
    Product, Quote, QuoteLineItem
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
            'id', 'name', 'industry', 'size', 
            'location', 'website', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ContactSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    
    class Meta:
        model = Contact
        fields = [
            'id', 'name', 'email', 'phone', 'account', 
            'account_name', 'title', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    
    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'email', 'phone', 'company', 'source',
            'status', 'assigned_to', 'assigned_to_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OpportunitySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    account_name = serializers.CharField(source='account.name', read_only=True)
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    
    class Meta:
        model = Opportunity
        fields = [
            'id', 'name', 'account', 'account_name', 'contact', 'contact_name',
            'amount', 'stage', 'close_date', 'owner', 
            'owner_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.get_full_name', read_only=True)
    related_lead_name = serializers.CharField(source='related_lead.name', read_only=True)
    related_opportunity_name = serializers.CharField(source='related_opportunity.name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'type', 'due_date', 'status',
            'related_lead', 'related_lead_name', 'related_opportunity', 'related_opportunity_name',
            'owner', 'owner_name', 'notes'
        ]
        read_only_fields = ['id']


class InteractionLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    lead_name = serializers.CharField(source='lead.name', read_only=True)
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    opportunity_name = serializers.CharField(source='opportunity.name', read_only=True)
    
    class Meta:
        model = InteractionLog
        fields = [
            'id', 'user', 'user_name', 'lead', 'lead_name',
            'contact', 'contact_name', 'opportunity', 'opportunity_name', 
            'type', 'summary', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'currency', 'is_active'
        ]
        read_only_fields = ['id']


class QuoteLineItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = QuoteLineItem
        fields = [
            'id', 'quote', 'product', 'product_name', 
            'quantity', 'unit_price', 'total_price'
        ]
        read_only_fields = ['id']


class QuoteSerializer(serializers.ModelSerializer):
    opportunity_name = serializers.CharField(source='opportunity.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    line_items = QuoteLineItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quote
        fields = [
            'id', 'opportunity', 'opportunity_name', 'title', 
            'total_price', 'created_by', 'created_by_name', 
            'created_at', 'notes', 'line_items'
        ]
        read_only_fields = ['id', 'created_at']

# --- Auth/User Registration/Profile Serializers ---
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'confirm_password', 'first_name', 'last_name', 'role')
        extra_kwargs = {
            'password': {'write_only': True},
            'confirm_password': {'write_only': True},
            'username': {'required': False},
        }

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        try:
            validate_password(data['password'])
        except ValidationError as e:
            raise serializers.ValidationError({"password": list(e)})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username', validated_data['email']),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'sales_rep')
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'role')
        read_only_fields = ('id', 'email', 'username', 'role')

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "New passwords do not match."})
        try:
            validate_password(data['new_password'], self.context['request'].user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": list(e)})
        return data
