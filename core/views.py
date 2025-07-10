from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
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

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for user APIs
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'first_name', 'last_name']

    def get_queryset(self):
        # Managers and admins can see all users, sales reps only see themselves
        if self.request.user.role in ['admin', 'manager']:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'industry', 'website']

    def get_queryset(self):
        return Account.objects.all().order_by('-created_at')

    @action(detail=True, methods=['get'])
    def contacts(self, request, pk=None):
        """Get all contacts associated with this account"""
        account = self.get_object()
        contacts = Contact.objects.filter(account=account)
        serializer = ContactSerializer(contacts, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def opportunities(self, request, pk=None):
        """Get all opportunities associated with this account"""
        account = self.get_object()
        opportunities = Opportunity.objects.filter(account=account)
        serializer = OpportunitySerializer(opportunities, many=True)
        return Response(serializer.data)


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']

    def get_queryset(self):
        queryset = Contact.objects.all().order_by('-created_at')
        
        # Filter by account if provided
        account_id = self.request.query_params.get('account', None)
        if account_id:
            queryset = queryset.filter(account_id=account_id)
            
        return queryset

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
            summary=summary
        )
        
        return Response({'status': 'Interaction logged successfully'})


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'company', 'phone']

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

    def perform_create(self, serializer):
        # Auto-assign to the current user if no assigned_to is provided
        if 'assigned_to' not in serializer.validated_data or serializer.validated_data.get('assigned_to') is None:
            serializer.validated_data['assigned_to'] = self.request.user
        
        # Save the lead - assigned_to should always be set now
        serializer.save()

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
        
        # Create contact
        contact, created = Contact.objects.get_or_create(
            email=lead.email,
            defaults={
                'name': lead.name,
                'phone': lead.phone,
                'account': account
            }
        )
        
        # Create opportunity
        opportunity = Opportunity.objects.create(
            name=f"Opportunity for {lead.name}",
            account=account,
            contact=contact,
            amount=0,  # To be updated later
            owner=lead.assigned_to or request.user
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
            summary=summary
        )
        
        return Response({'status': 'Interaction logged successfully'})


class OpportunityViewSet(viewsets.ModelViewSet):
    queryset = Opportunity.objects.all()
    serializer_class = OpportunitySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'account__name', 'contact__name']

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

    @action(detail=True, methods=['get'])
    def quotes(self, request, pk=None):
        """Get all quotes for this opportunity"""
        opportunity = self.get_object()
        quotes = Quote.objects.filter(opportunity=opportunity)
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
            summary=summary
        )
        
        return Response({'status': 'Interaction logged successfully'})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'owner__email']

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
        
        # Create interaction log for task completion
        create_task_completion_log(task, request.user)
        
        return Response({'status': 'Task marked as completed'})


class InteractionLogViewSet(viewsets.ModelViewSet):
    queryset = InteractionLog.objects.all()
    serializer_class = InteractionLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['note', 'lead__name', 'contact__name', 'opportunity__name']

    def get_queryset(self):
        queryset = InteractionLog.objects.all().order_by('-timestamp')
        
        # Filter by user based on role
        if self.request.user.role == 'sales_rep':
            queryset = queryset.filter(user=self.request.user)
        
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
        serializer.save(user=self.request.user)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'description']

    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filter by active status if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
            
        return queryset


class QuoteViewSet(viewsets.ModelViewSet):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['opportunity__name', 'created_by__email']

    def get_queryset(self):
        queryset = Quote.objects.all().order_by('-created_at')
        
        # Filter by opportunity if provided
        opportunity_id = self.request.query_params.get('opportunity', None)
        if opportunity_id:
            queryset = queryset.filter(opportunity_id=opportunity_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

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
            product = Product.objects.get(id=product_id)
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
            unit_price=unit_price
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
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'quote__id']

    def get_queryset(self):
        queryset = QuoteLineItem.objects.all()
        
        # Filter by quote if provided
        quote_id = self.request.query_params.get('quote', None)
        if quote_id:
            queryset = queryset.filter(quote_id=quote_id)
            
        return queryset

    def perform_create(self, serializer):
        line_item = serializer.save()
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
