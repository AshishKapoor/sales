from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db.models import Q
from rest_framework import filters, generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Account,
    Contact,
    InteractionLog,
    Lead,
    Opportunity,
    Organization,
    Product,
    Quote,
    QuoteLineItem,
    Task,
)
from .serializers import (
    AccountSerializer,
    ContactSerializer,
    InteractionLogSerializer,
    LeadSerializer,
    OpportunitySerializer,
    OrganizationSerializer,
    ProductSerializer,
    QuoteLineItemSerializer,
    QuoteSerializer,
    TaskSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)
from .signals import create_lead_conversion_log, create_task_completion_log

# class DashboardActivityView(APIView):
#     """Get formatted activity feed for dashboard display."""
#     permission_classes = [permissions.IsAuthenticated]
    
#     def get(self, request):
#         from .utils import get_dashboard_activity_feed, get_user_activity_summary
        
#         # Get query parameters
#         days = int(request.query_params.get('days', 7))
#         limit = int(request.query_params.get('limit', 20))
#         user_filter = request.query_params.get('user')
        
#         # Apply user filter
#         if user_filter == 'me':
#             user = request.user
#         elif user_filter and request.user.role in ['admin', 'manager']:
#             try:
#                 user = User.objects.get(id=user_filter)
#             except User.DoesNotExist:
#                 user = None
#         else:
#             user = None
        
#         # Get activity feed
#         activities = get_dashboard_activity_feed(user=user, days=days, limit=limit)
        
#         # Get user summary if filtering by specific user
#         summary = None
#         if user:
#             summary = get_user_activity_summary(user, days=days)
        
#         return Response({
#             'activities': activities,
#             'summary': summary,
#             'filters': {
#                 'days': days,
#                 'limit': limit,
#                 'user': user.id if user else None
#             }
#         })


# --- Auth Views ---
class RegisterUserAPIView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response({"email": ["Email is required."]}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_email(email)
        except ValidationError:
            return Response({"email": ["Enter a valid email address."]}, status=status.HTTP_400_BAD_REQUEST)
        if get_user_model().objects.filter(email=email).exists():
            return Response({"email": ["Something went wrong. Please contact support or try again."]}, status=status.HTTP_400_BAD_REQUEST)
        mutable_data = request.data.copy()
        mutable_data['username'] = email
        request._full_data = mutable_data
        return super().create(request, *args, **kwargs)

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return Response({"error": "All password fields are required"}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"error": "New passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            from django.contrib.auth.password_validation import validate_password
            validate_password(new_password, user)
        except ValidationError as e:
            return Response({"error": list(e)}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully"}, status=status.HTTP_200_OK)

User = get_user_model()


# Custom Permission for organization-based access
class HasOrganizationAccess(permissions.BasePermission):
    """
    Permission to check if user belongs to an organization
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.organization is not None

    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.organization is None:
            return False
        
        # Check if object belongs to user's organization
        if hasattr(obj, 'organization'):
            return obj.organization == request.user.organization
        return True


class NoOrganizationView(APIView):
    """
    View to handle users without organization
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.organization is not None:
            return Response({'has_organization': True})
        return Response({
            'has_organization': False,
            'message': 'Please contact your company\'s administrator to be added to an organization.'
        })


class CreateOrganizationForUserView(APIView):
    """
    Allow users without organization to create one and join it
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Only allow users without organization to create one
        if request.user.organization is not None:
            return Response(
                {'error': 'You already belong to an organization'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        name = request.data.get('name', '').strip()
        description = request.data.get('description', '').strip()
        
        if not name:
            return Response(
                {'error': 'Organization name is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if organization name already exists
        if Organization.objects.filter(name=name).exists():
            return Response(
                {'error': 'An organization with this name already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create the organization
            organization = Organization.objects.create(
                name=name,
                description=description
            )
            
            # Update user to join the organization and make them admin
            request.user.organization = organization
            request.user.role = 'admin'  # Make them admin of their new organization
            request.user.save()
            
            return Response(OrganizationSerializer(organization).data, status=status.HTTP_201_CREATED)
        except Exception:
            return Response(
                {'error': 'Failed to create organization'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrganizationViewSet(viewsets.ModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Organization.objects.none()
        
        # Only admins can see all organizations
        if self.request.user.role == 'admin':
            return Organization.objects.all().order_by('name')
        # Others can only see their own organization
        elif self.request.user.organization:
            return Organization.objects.filter(id=self.request.user.organization.id)
        return Organization.objects.none()

    def get_permissions(self):
        """
        Only admins can create/update/delete organizations
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            if hasattr(self.request, 'user') and self.request.user.is_authenticated and self.request.user.role != 'admin':
                self.permission_classes = [permissions.IsAuthenticated]
                return [permission() for permission in self.permission_classes]
        return super().get_permissions()

    @action(detail=True, methods=['post'])
    def add_user(self, request, pk=None):
        """Add a user to this organization (admin only)"""
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can add users to organizations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        organization = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
            user.organization = organization
            user.save()
            return Response({'message': f'User {user.username} added to {organization.name}'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def remove_user(self, request, pk=None):
        """Remove a user from this organization (admin only)"""
        if not request.user.is_authenticated or request.user.role != 'admin':
            return Response(
                {'error': 'Only admins can remove users from organizations'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        organization = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id, organization=organization)
            user.organization = None
            user.save()
            return Response({'message': f'User {user.username} removed from {organization.name}'})
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found in this organization'},
                status=status.HTTP_404_NOT_FOUND
            )


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    pagination_class = None  # Disable pagination for user APIs
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return User.objects.none()
        
        # Users without organization can't see any users
        if not self.request.user.organization:
            return User.objects.none()
        
        # Admins can see all users in all organizations
        if self.request.user.role == 'admin':
            return User.objects.all()
        
        # Managers and sales reps can only see users in their organization
        return User.objects.filter(organization=self.request.user.organization)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'industry', 'website']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Account.objects.none()
        
        # Users without organization can't see any accounts
        if not self.request.user.organization:
            return Account.objects.none()
        
        # All users in the organization can see all accounts in their organization
        return Account.objects.filter(organization=self.request.user.organization).order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically set organization for new accounts
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Get all contacts associated with this account"""
        account = self.get_object()
        contacts = Contact.objects.filter(account=account, organization=self.request.user.organization)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def opportunities(self, request, pk=None):
        """Get all opportunities associated with this account"""
        account = self.get_object()
        opportunities = Opportunity.objects.filter(account=account, organization=self.request.user.organization)
        serializer = OpportunitySerializer(opportunities, many=True)
        return Response(serializer.data)


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Contact.objects.none()
        
        # Users without organization can't see any contacts
        if not self.request.user.organization:
            return Contact.objects.none()
        
        # All users in the organization can see all contacts in their organization
        queryset = Contact.objects.filter(organization=self.request.user.organization).order_by('-created_at')
        
        # Filter by account if provided
        account_id = self.request.query_params.get('account', None)
        if account_id:
            queryset = queryset.filter(account_id=account_id)
            
        return queryset

    def perform_create(self, serializer):
        # Automatically set organization for new contacts
        serializer.save(organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def log_interaction(self, request, pk=None):
        """Log a manual interaction with this contact"""
        contact = self.get_object()
        interaction_type = request.data.get('type', 'note')
        summary = request.data.get('summary', '')
        
        if not summary:
            return Response(
                {'error': 'Summary is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        InteractionLog.objects.create(
            user=request.user,
            contact=contact,
            type=interaction_type,
            summary=summary,
            organization=request.user.organization
        )
        
        return Response({'status': 'Interaction logged successfully'})


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company', 'phone']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Lead.objects.none()
        
        # Users without organization can't see any leads
        if not self.request.user.organization:
            return Lead.objects.none()
        
        # All users in the organization can see all leads in their organization
        queryset = Lead.objects.filter(organization=self.request.user.organization).order_by('-created_at')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    def perform_create(self, serializer):
        # Auto-assign to the current user if no assigned_to is provided
        if 'assigned_to' not in serializer.validated_data or serializer.validated_data.get('assigned_to') is None:
            serializer.validated_data['assigned_to'] = self.request.user
        
        # Automatically set organization for new leads
        serializer.save(organization=self.request.user.organization)

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
            name=lead.company or f"{lead.name} Company",
            organization=request.user.organization,
            defaults={'organization': request.user.organization}
        )
        
        # Create contact
        contact, created = Contact.objects.get_or_create(
            email=lead.email,
            organization=request.user.organization,
            defaults={
                'name': lead.name,
                'phone': lead.phone,
                'account': account,
                'organization': request.user.organization
            }
        )
        
        # Create opportunity
        opportunity = Opportunity.objects.create(
            name=f"Opportunity for {lead.name}",
            account=account,
            contact=contact,
            amount=0,  # To be updated later
            owner=lead.assigned_to or request.user,
            organization=request.user.organization
        )
        
        # Update lead status
        lead.status = 'converted'
        lead.save()
        
        # Create interaction log for lead conversion
        create_lead_conversion_log(lead, opportunity, request.user)
        
        return Response(OpportunitySerializer(opportunity).data)

    @action(detail=True, methods=['post'])
    def log_interaction(self, request, pk=None):
        """Log a manual interaction with this lead"""
        lead = self.get_object()
        interaction_type = request.data.get('type', 'note')
        summary = request.data.get('summary', '')
        
        if not summary:
            return Response(
                {'error': 'Summary is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        InteractionLog.objects.create(
            user=request.user,
            lead=lead,
            type=interaction_type,
            summary=summary,
            organization=request.user.organization
        )
        
        return Response({'status': 'Interaction logged successfully'})


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'account__name', 'contact__name']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Opportunity.objects.none()
        
        # Users without organization can't see any opportunities
        if not self.request.user.organization:
            return Opportunity.objects.none()
        
        # All users in the organization can see all opportunities in their organization
        queryset = Opportunity.objects.filter(organization=self.request.user.organization).order_by('-created_at')
        
        # Filter by stage if provided
        stage_filter = self.request.query_params.get('stage', None)
        if stage_filter:
            queryset = queryset.filter(stage=stage_filter)
            
        return queryset

    def perform_create(self, serializer):
        # Auto-assign to the current user if no owner is provided
        if 'owner' not in serializer.validated_data or serializer.validated_data.get('owner') is None:
            print(f"DEBUG: Auto-assigning opportunity to user: {self.request.user}")
            serializer.validated_data['owner'] = self.request.user
        else:
            print(f"DEBUG: Opportunity already has owner: {serializer.validated_data.get('owner')}")
        
        # Automatically set organization for new opportunities
        serializer.save(organization=self.request.user.organization)

    @action(detail=False, methods=['get'])
    def pipeline_value(self, request):
        """Get total pipeline value"""
        queryset = self.get_queryset().exclude(stage__in=['won', 'lost'])
        total_value = sum(opp.amount for opp in queryset)
        return Response({'total_pipeline_value': total_value})

    @action(detail=True, methods=['get'])
    def quotes(self, request, pk=None):
        """Get all quotes for this opportunity"""
        opportunity = self.get_object()
        quotes = Quote.objects.filter(opportunity=opportunity, organization=self.request.user.organization)
        serializer = QuoteSerializer(quotes, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def log_interaction(self, request, pk=None):
        """Log a manual interaction with this opportunity"""
        opportunity = self.get_object()
        interaction_type = request.data.get('type', 'note')
        summary = request.data.get('summary', '')
        
        if not summary:
            return Response(
                {'error': 'Summary is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        InteractionLog.objects.create(
            user=request.user,
            opportunity=opportunity,
            contact=opportunity.contact,
            type=interaction_type,
            summary=summary,
            organization=request.user.organization
        )
        
        return Response({'status': 'Interaction logged successfully'})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'owner__email']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Task.objects.none()
        
        # Users without organization can't see any tasks
        if not self.request.user.organization:
            return Task.objects.none()
        
        # All users in the organization can see all tasks in their organization
        queryset = Task.objects.filter(organization=self.request.user.organization).order_by('due_date')
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, organization=self.request.user.organization)

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
        
        # Create interaction log for task completion
        create_task_completion_log(task, request.user)
        
        return Response({'status': 'Task marked as completed'})


class InteractionLogViewSet(viewsets.ModelViewSet):
    queryset = InteractionLog.objects.all()
    serializer_class = InteractionLogSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['summary', 'lead__name', 'contact__name', 'opportunity__name']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return InteractionLog.objects.none()
        
        # Users without organization can't see any interaction logs
        if not self.request.user.organization:
            return InteractionLog.objects.none()
        
        # All users in the organization can see all interaction logs in their organization
        queryset = InteractionLog.objects.filter(organization=self.request.user.organization).order_by('-timestamp')
        
        # Filter by lead or opportunity if provided
        lead_id = self.request.query_params.get('lead', None)
        if lead_id:
            queryset = queryset.filter(lead_id=lead_id)
            
        contact_id = self.request.query_params.get('contact', None)
        if contact_id:
            queryset = queryset.filter(contact_id=contact_id)
            
        opportunity_id = self.request.query_params.get('opportunity', None)
        if opportunity_id:
            queryset = queryset.filter(opportunity_id=opportunity_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, organization=self.request.user.organization)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Product.objects.none()
        
        # Users without organization can't see any products
        if not self.request.user.organization:
            return Product.objects.none()
        
        # All users in the organization can see all products in their organization
        queryset = Product.objects.filter(organization=self.request.user.organization)
        
        # Filter by active status if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset

    def perform_create(self, serializer):
        # Automatically set organization for new products
        serializer.save(organization=self.request.user.organization)

    @action(detail=False, methods=['get'])
    def available_for_quotes(self, request):
        """Get products available for creating quotes"""
        if not request.user.is_authenticated or not request.user.organization:
            return Response([])
        
        # All users can browse active products in their organization when creating quotes
        queryset = Product.objects.filter(
            organization=request.user.organization,
            is_active=True
        )
            
        # Apply search if provided
        search = request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        """
        Override permissions based on action and user role
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admins and managers can modify products
            if hasattr(self.request, 'user') and self.request.user.is_authenticated and self.request.user.role not in ['admin', 'manager']:
                self.permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
                return [permission() for permission in self.permission_classes]
        return super().get_permissions()
    
    def create(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Only admins and managers can create products'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Only admins and managers can update products'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        if not request.user.is_authenticated or request.user.role not in ['admin', 'manager']:
            return Response(
                {'error': 'Only admins and managers can delete products'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['opportunity__name', 'created_by__email']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return Quote.objects.none()
        
        # Users without organization can't see any quotes
        if not self.request.user.organization:
            return Quote.objects.none()
        
        # All users in the organization can see all quotes in their organization
        queryset = Quote.objects.filter(organization=self.request.user.organization).order_by('-created_at')
        
        # Filter by opportunity if provided
        opportunity_id = self.request.query_params.get('opportunity', None)
        if opportunity_id:
            queryset = queryset.filter(opportunity_id=opportunity_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user, organization=self.request.user.organization)

    @action(detail=True, methods=['post'])
    def add_line_item(self, request, pk=None):
        """Add a line item to the quote"""
        quote = self.get_object()
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        unit_price = request.data.get('unit_price')
        
        if not product_id:
            return Response(
                {'error': 'product_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            product = Product.objects.get(id=product_id, organization=request.user.organization)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Use product price if unit_price not provided
        if not unit_price:
            unit_price = product.price
        
        line_item = QuoteLineItem.objects.create(
            quote=quote,
            product=product,
            quantity=quantity,
            unit_price=unit_price,
            organization=request.user.organization
        )
        
        # Update quote total
        self._update_quote_total(quote)
        
        return Response(QuoteLineItemSerializer(line_item).data)

    def _update_quote_total(self, quote):
        """Update the quote's total price based on line items"""
        total = sum(item.total_price for item in quote.line_items.all())
        quote.total_price = total
        quote.save()


class QuoteLineItemViewSet(viewsets.ModelViewSet):
    queryset = QuoteLineItem.objects.all()
    serializer_class = QuoteLineItemSerializer
    permission_classes = [permissions.IsAuthenticated, HasOrganizationAccess]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'quote__id']

    def get_queryset(self):
        # Return empty queryset for unauthenticated users
        if not self.request.user.is_authenticated:
            return QuoteLineItem.objects.none()
        
        # Users without organization can't see any quote line items
        if not self.request.user.organization:
            return QuoteLineItem.objects.none()
        
        # All users in the organization can see all quote line items in their organization
        queryset = QuoteLineItem.objects.filter(organization=self.request.user.organization)
        
        # Filter by quote if provided
        quote_id = self.request.query_params.get('quote', None)
        if quote_id:
            queryset = queryset.filter(quote_id=quote_id)
            
        return queryset

    def perform_create(self, serializer):
        line_item = serializer.save(organization=self.request.user.organization)
        # Update quote total after adding line item
        self._update_quote_total(line_item.quote)

    def perform_update(self, serializer):
        line_item = serializer.save()
        # Update quote total after updating line item
        self._update_quote_total(line_item.quote)

    def perform_destroy(self, instance):
        quote = instance.quote
        instance.delete()
        # Update quote total after removing line item
        self._update_quote_total(quote)

    def _update_quote_total(self, quote):
        """Update the quote's total price based on line items"""
        total = sum(item.total_price for item in quote.line_items.all())
        quote.total_price = total
        quote.save()
