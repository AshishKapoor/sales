from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from datetime import date
from .models import (
    Account, Lead, Opportunity, Task, InteractionLog,
    Cookbook, CookbookActivity, CookbookAssignment, ActivityProgress
)
from .serializers import (
    UserSerializer, AccountSerializer, LeadSerializer, OpportunitySerializer,
    TaskSerializer, InteractionLogSerializer, CookbookSerializer,
    CookbookActivitySerializer, CookbookAssignmentSerializer, ActivityProgressSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Managers and admins can see all users, sales reps only see themselves
        if self.request.user.role in ['admin', 'manager']:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Account.objects.all().order_by('-created_at')

    @action(detail=True, methods=['get'])
    def leads(self, request, pk=None):
        """Get all leads associated with this account"""
        account = self.get_object()
        leads = Lead.objects.filter(account=account)
        serializer = LeadSerializer(leads, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def opportunities(self, request, pk=None):
        """Get all opportunities associated with this account"""
        account = self.get_object()
        opportunities = Opportunity.objects.filter(account=account)
        serializer = OpportunitySerializer(opportunities, many=True)
        return Response(serializer.data)


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Lead.objects.all().order_by('-created_at')
        
        # Filter by assignment based on user role
        if self.request.user.role == 'sales_rep':
            queryset = queryset.filter(assigned_to=self.request.user)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    @action(detail=True, methods=['post'])
    def convert_to_opportunity(self, request, pk=None):
        """Convert a lead to an opportunity"""
        lead = self.get_object()
        
        if lead.status != 'qualified':
            return Response(
                {'error': 'Only qualified leads can be converted to opportunities'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or get account
        account, created = Account.objects.get_or_create(
            name=lead.company or f"{lead.name} Company"
        )
        
        # Create opportunity
        opportunity = Opportunity.objects.create(
            title=f"Opportunity for {lead.name}",
            account=account,
            contact_email=lead.email,
            amount=0,  # To be updated later
            owner=lead.assigned_to or request.user
        )
        
        # Update lead status
        lead.status = 'converted'
        lead.account = account
        lead.save()
        
        return Response(OpportunitySerializer(opportunity).data)


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Opportunity.objects.all().order_by('-created_at')
        
        # Filter by ownership based on user role
        if self.request.user.role == 'sales_rep':
            queryset = queryset.filter(owner=self.request.user)
        
        # Filter by stage if provided
        stage_filter = self.request.query_params.get('stage', None)
        if stage_filter:
            queryset = queryset.filter(stage=stage_filter)
            
        return queryset

    @action(detail=False, methods=['get'])
    def pipeline_value(self, request):
        """Get total pipeline value"""
        queryset = self.get_queryset().exclude(stage__in=['won', 'lost'])
        total_value = sum(opp.amount for opp in queryset)
        return Response({'total_pipeline_value': total_value})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.all().order_by('due_date')
        
        # Filter by ownership
        if self.request.user.role == 'sales_rep':
            queryset = queryset.filter(owner=self.request.user)
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """Get overdue tasks"""
        queryset = self.get_queryset().filter(
            due_date__lt=date.today(),
            status='pending'
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_completed(self, request, pk=None):
        """Mark a task as completed"""
        task = self.get_object()
        task.status = 'completed'
        task.save()
        return Response({'status': 'Task marked as completed'})


class InteractionLogViewSet(viewsets.ModelViewSet):
    queryset = InteractionLog.objects.all()
    serializer_class = InteractionLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = InteractionLog.objects.all().order_by('-timestamp')
        
        # Filter by user based on role
        if self.request.user.role == 'sales_rep':
            queryset = queryset.filter(user=self.request.user)
        
        # Filter by lead or opportunity if provided
        lead_id = self.request.query_params.get('lead', None)
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
            
        opportunity_id = self.request.query_params.get('opportunity', None)
        if opportunity_id:
            queryset = queryset.filter(opportunity_id=opportunity_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class CookbookViewSet(viewsets.ModelViewSet):
    queryset = Cookbook.objects.all()
    serializer_class = CookbookSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cookbook.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def assign_to_user(self, request, pk=None):
        """Assign cookbook to a user"""
        cookbook = self.get_object()
        user_id = request.data.get('user_id')
        start_date = request.data.get('start_date', date.today())
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        assignment, created = CookbookAssignment.objects.get_or_create(
            user=user,
            cookbook=cookbook,
            defaults={'start_date': start_date}
        )
        
        serializer = CookbookAssignmentSerializer(assignment)
        return Response(serializer.data)


class CookbookActivityViewSet(viewsets.ModelViewSet):
    queryset = CookbookActivity.objects.all()
    serializer_class = CookbookActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        cookbook_id = self.request.query_params.get('cookbook', None)
        if cookbook_id:
            return CookbookActivity.objects.filter(cookbook_id=cookbook_id)
        return CookbookActivity.objects.all()


class CookbookAssignmentViewSet(viewsets.ModelViewSet):
    queryset = CookbookAssignment.objects.all()
    serializer_class = CookbookAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CookbookAssignment.objects.all()
        
        # Filter by user based on role
        if self.request.user.role == 'sales_rep':
            queryset = queryset.filter(user=self.request.user)
            
        return queryset

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get progress for this assignment"""
        assignment = self.get_object()
        progress = ActivityProgress.objects.filter(assignment=assignment)
        serializer = ActivityProgressSerializer(progress, many=True)
        return Response(serializer.data)


class ActivityProgressViewSet(viewsets.ModelViewSet):
    queryset = ActivityProgress.objects.all()
    serializer_class = ActivityProgressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ActivityProgress.objects.all().order_by('-date')
        
        # Filter by user based on role
        if self.request.user.role == 'sales_rep':
            queryset = queryset.filter(assignment__user=self.request.user)
            
        return queryset
