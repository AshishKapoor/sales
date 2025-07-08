# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

# 1. User
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('sales_rep', 'Sales Representative'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sales_rep')

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

# 2. Lead
class Lead(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('qualified', 'Qualified'),
        ('converted', 'Converted'),
        ('disqualified', 'Disqualified'),
    ]
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=100, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='leads')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        company_part = f" ({self.company})" if self.company else ""
        return f"{self.name}{company_part} - {self.get_status_display()}"

# 3. Account
class Account(models.Model):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255, blank=True)
    size = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        industry_part = f" ({self.industry})" if self.industry else ""
        return f"{self.name}{industry_part}"

# 4. Contact
class Contact(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='contacts')
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        title_part = f" ({self.title})" if self.title else ""
        return f"{self.name}{title_part} at {self.account.name}"

# 5. Opportunity (aka Deal)
class Opportunity(models.Model):
    STAGE_CHOICES = [
        ('qualification', 'Qualification'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('won', 'Closed Won'),
        ('lost', 'Closed Lost'),
    ]
    name = models.CharField(max_length=255)
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name='opportunities')
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='qualification')
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='opportunities')
    close_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - ${self.amount:,.2f} ({self.get_stage_display()})"

# 6. Task (e.g. call, follow-up, meeting)
class Task(models.Model):
    TYPE_CHOICES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
        ('demo', 'Demo'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    ]
    title = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    related_lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True)
    related_opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} ({self.get_type_display()}) - {self.get_status_display()}"

# 7. InteractionLog (Activity History)
class InteractionLog(models.Model):
    TYPE_CHOICES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
        ('note', 'Note'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lead = models.ForeignKey(Lead, on_delete=models.SET_NULL, null=True, blank=True)
    contact = models.ForeignKey(Contact, on_delete=models.SET_NULL, null=True, blank=True)
    opportunity = models.ForeignKey(Opportunity, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    summary = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        target = self.lead or self.contact or self.opportunity or "Unknown"
        return f"{self.get_type_display()} with {target} by {self.user.username}"

# 8. Product
class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default='USD')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.currency} {self.price})"

# 9. Quote
class Quote(models.Model):
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, related_name='quotes')
    title = models.CharField(max_length=255)
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def calculate_total_price(self):
        """Calculate total price from all line items."""
        total = sum(item.total_price for item in self.line_items.all())
        return total

    def update_total_price(self):
        """Update the total_price field with calculated value."""
        self.total_price = self.calculate_total_price()
        self.save(update_fields=['total_price'])

    def __str__(self):
        return f"{self.title} - {self.total_price}"

# 10. QuoteLineItem
class QuoteLineItem(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='line_items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)

    @property
    def total_price(self):
        """Calculate total price for this line item."""
        if self.unit_price is None:
            return 0
        return self.quantity * self.unit_price

    def __str__(self):
        product_name = self.product.name if self.product else "No Product"
        return f"{product_name} x {self.quantity} @ {self.unit_price}"
