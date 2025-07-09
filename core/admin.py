from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

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

User = get_user_model()


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Role', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Role', {'fields': ('role',)}),
    )


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'size', 'location', 'website', 'created_at')
    list_filter = ('industry', 'size', 'created_at')
    search_fields = ('name', 'industry', 'location', 'website')
    readonly_fields = ('created_at',)


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'account', 'title', 'created_at')
    list_filter = ('account', 'created_at')
    search_fields = ('name', 'email', 'phone', 'title', 'account__name')
    readonly_fields = ('created_at',)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'status', 'assigned_to', 'created_at', 'updated_at')
    list_filter = ('status', 'assigned_to', 'source', 'created_at', 'updated_at')
    search_fields = ('name', 'email', 'company')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'account', 'contact', 'amount', 'stage', 'owner', 'close_date', 'created_at')
    list_filter = ('stage', 'owner', 'created_at')
    search_fields = ('name', 'account__name', 'contact__name', 'contact__email')
    readonly_fields = ('created_at',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'due_date', 'status', 'owner', 'related_lead', 'related_opportunity')
    list_filter = ('type', 'status', 'due_date', 'owner')
    search_fields = ('title', 'notes')


@admin.register(InteractionLog)
class InteractionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'lead', 'contact', 'opportunity', 'timestamp')
    list_filter = ('type', 'user', 'timestamp')
    search_fields = ('summary',)
    readonly_fields = ('timestamp',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'currency', 'is_active')
    list_filter = ('currency', 'is_active')
    search_fields = ('name', 'description')


class QuoteLineItemInline(admin.TabularInline):
    model = QuoteLineItem
    extra = 1
    readonly_fields = ('total_price',)


@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'opportunity', 'total_price', 'created_by', 'created_at')
    list_filter = ('created_by', 'created_at')
    search_fields = ('title', 'opportunity__name', 'notes')
    readonly_fields = ('created_at', 'total_price')
    inlines = [QuoteLineItemInline]


@admin.register(QuoteLineItem)
class QuoteLineItemAdmin(admin.ModelAdmin):
    list_display = ('quote', 'product', 'quantity', 'unit_price', 'total_price')
    list_filter = ('quote', 'product')
    readonly_fields = ('total_price',)
