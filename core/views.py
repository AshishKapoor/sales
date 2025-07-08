from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.db.models import Q
from datetime import date
from .models import (
    Account, Contact, Lead, Opportunity, Task, InteractionLog,
    Product, Quote, QuoteLineItem
)
from .serializers import (
    UserSerializer, AccountSerializer, ContactSerializer, LeadSerializer, OpportunitySerializer,
    TaskSerializer, InteractionLogSerializer, ProductSerializer, QuoteSerializer, QuoteLineItemSerializer
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
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Contact.objects.all().order_by('-created_at')
        
        # Filter by account if provided
        account_id = self.request.query_params.get('account', None)
        if account_id:
            queryset = queryset.filter(account_id=account_id)
            
        return queryset


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

    @action(detail=True, methods=['get'])
    def quotes(self, request, pk=None):
        """Get all quotes for this opportunity"""
        opportunity = self.get_object()
        quotes = Quote.objects.filter(opportunity=opportunity)
        serializer = QuoteSerializer(quotes, many=True)
        return Response(serializer.data)


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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

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
