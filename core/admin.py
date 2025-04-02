from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin as BaseGroupAdmin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group, User
from core.models import Todo

admin.site.unregister(User)
admin.site.unregister(Group)
admin.site.register(Todo)

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """User admin"""

@admin.register(Group)
class GroupAdmin(BaseGroupAdmin):
    """Group admin"""
