from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model
from .models import (
    Account, Lead, Opportunity, Task, InteractionLog,
    Cookbook, CookbookActivity, CookbookAssignment, ActivityProgress
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
    list_display = ('name', 'industry', 'company_size', 'location', 'created_at')
    list_filter = ('industry', 'company_size', 'created_at')
    search_fields = ('name', 'industry', 'location')
    readonly_fields = ('created_at',)


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'company', 'status', 'assigned_to', 'created_at')
    list_filter = ('status', 'assigned_to', 'source', 'created_at')
    search_fields = ('name', 'email', 'company')
    readonly_fields = ('created_at',)


@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('title', 'account', 'amount', 'stage', 'owner', 'expected_close_date', 'created_at')
    list_filter = ('stage', 'owner', 'created_at')
    search_fields = ('title', 'account__name', 'contact_email')
    readonly_fields = ('created_at',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'task_type', 'due_date', 'status', 'owner')
    list_filter = ('task_type', 'status', 'due_date', 'owner')
    search_fields = ('title', 'notes')


@admin.register(InteractionLog)
class InteractionLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'type', 'lead', 'opportunity', 'timestamp')
    list_filter = ('type', 'user', 'timestamp')
    search_fields = ('summary',)
    readonly_fields = ('timestamp',)


@admin.register(Cookbook)
class CookbookAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at')
    list_filter = ('created_by', 'created_at')
    search_fields = ('title', 'description')
    readonly_fields = ('created_at',)


@admin.register(CookbookActivity)
class CookbookActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'cookbook', 'frequency', 'target_count')
    list_filter = ('frequency', 'cookbook')
    search_fields = ('title', 'description')


@admin.register(CookbookAssignment)
class CookbookAssignmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'cookbook', 'start_date')
    list_filter = ('user', 'cookbook', 'start_date')


@admin.register(ActivityProgress)
class ActivityProgressAdmin(admin.ModelAdmin):
    list_display = ('assignment', 'activity', 'date', 'count_done')
    list_filter = ('date', 'assignment__user', 'activity')
    readonly_fields = ('assignment', 'activity')
