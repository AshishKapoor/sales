from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

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

User = get_user_model()


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'organization', 'is_staff')
    list_filter = ('role', 'organization', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Organization & Role', {'fields': ('role', 'organization')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Organization & Role', {'fields': ('role', 'organization')}),
    )


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'size', 'location', 'organization', 'created_at')
    list_filter = ('industry', 'size', 'organization', 'created_at')
    search_fields = ('name', 'industry', 'location', 'website')
    readonly_fields = ('created_at',)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'account', 'organization', 'created_at')
    list_filter = ('account', 'organization', 'created_at')
    search_fields = ('name', 'email', 'phone', 'title', 'account__name')
    readonly_fields = ('created_at',)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'status', 'assigned_to', 'organization', 'created_at')
    list_filter = ('status', 'assigned_to', 'organization', 'source', 'created_at', 'updated_at')
    search_fields = ('name', 'email', 'company')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'account', 'contact', 'amount', 'stage', 'owner', 'organization', 'created_at')
    list_filter = ('stage', 'owner', 'organization', 'created_at')
    search_fields = ('name', 'account__name', 'contact__name', 'contact__email')
    readonly_fields = ('created_at',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'due_date', 'status', 'owner', 'organization')
    list_filter = ('type', 'status', 'due_date', 'owner', 'organization')
    search_fields = ('title', 'notes')


@admin.register(InteractionLog)
class InteractionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'lead', 'contact', 'opportunity', 'organization', 'timestamp')
    list_filter = ('type', 'user', 'organization', 'timestamp')
    search_fields = ('summary',)
    readonly_fields = ('timestamp',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'currency', 'organization', 'is_active')
    list_filter = ('currency', 'organization', 'is_active')
    search_fields = ('name', 'description')


class QuoteLineItemInline(admin.TabularInline):
    model = QuoteLineItem
    extra = 1
    readonly_fields = ('total_price',)


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'opportunity', 'total_price', 'created_by', 'organization', 'created_at')
    list_filter = ('created_by', 'organization', 'created_at')
    search_fields = ('title', 'opportunity__name', 'notes')
    readonly_fields = ('created_at', 'total_price')
    inlines = [QuoteLineItemInline]


@admin.register(QuoteLineItem)
class QuoteLineItemAdmin(admin.ModelAdmin):
    list_display = ('quote', 'product', 'quantity', 'unit_price', 'organization', 'total_price')
    list_filter = ('quote', 'product', 'organization')
    readonly_fields = ('total_price',)
