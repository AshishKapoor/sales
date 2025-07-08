# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

# 1. Custom User
class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('sales_rep', 'Sales Representative'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sales_rep')

# 2. Account
class Account(models.Model):
    name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255, blank=True, null=True)
    company_size = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 3. Lead
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
    source = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="leads")
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.status}"

# 4. Opportunity
class Opportunity(models.Model):
    STAGE_CHOICES = [
        ('qualification', 'Qualification'),
        ('proposal', 'Proposal'),
        ('negotiation', 'Negotiation'),
        ('won', 'Closed Won'),
        ('lost', 'Closed Lost'),
    ]
    title = models.CharField(max_length=255)
    account = models.ForeignKey(Account, on_delete=models.CASCADE)
    contact_email = models.EmailField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default='qualification')
    expected_close_date = models.DateField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="opportunities")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.account.name} - ${self.amount}"

    class Meta:
        verbose_name_plural = "Opportunities"

# 5. Task
class Task(models.Model):
    TASK_TYPE_CHOICES = [
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
    task_type = models.CharField(max_length=20, choices=TASK_TYPE_CHOICES)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True)
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.title} - {self.task_type} - {self.due_date}"

# 6. InteractionLog
class InteractionLog(models.Model):
    TYPE_CHOICES = [
        ('call', 'Call'),
        ('email', 'Email'),
        ('note', 'Note'),
        ('meeting', 'Meeting'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, null=True, blank=True)
    opportunity = models.ForeignKey(Opportunity, on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    summary = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} - {self.user.username} - {self.timestamp.date()}"

# 7. Cookbook
class Cookbook(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# 8. CookbookActivity
class CookbookActivity(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    cookbook = models.ForeignKey(Cookbook, on_delete=models.CASCADE, related_name="activities")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    target_count = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.title} ({self.cookbook.title})"

# 9. CookbookAssignment
class CookbookAssignment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cookbook = models.ForeignKey(Cookbook, on_delete=models.CASCADE)
    start_date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.cookbook.title}"

# 10. ActivityProgress
class ActivityProgress(models.Model):
    assignment = models.ForeignKey(CookbookAssignment, on_delete=models.CASCADE)
    activity = models.ForeignKey(CookbookActivity, on_delete=models.CASCADE)
    date = models.DateField()
    count_done = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.activity.title} - {self.date} - {self.count_done}/{self.activity.target_count}"
