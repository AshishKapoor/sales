from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Organization

User = get_user_model()


class Command(BaseCommand):
    help = 'Assign a user to an organization'

    def add_arguments(self, parser):
        parser.add_argument('user_email', type=str, help='Email of the user to assign')
        parser.add_argument('organization_name', type=str, help='Name of the organization')
        parser.add_argument('--role', type=str, choices=['admin', 'manager', 'sales_rep'], 
                          help='Role to assign to the user', default=None)

    def handle(self, *args, **options):
        user_email = options['user_email']
        org_name = options['organization_name']
        role = options.get('role')

        try:
            user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'User with email {user_email} not found')
            )
            return

        try:
            organization = Organization.objects.get(name=org_name)
        except Organization.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'Organization {org_name} not found')
            )
            return

        # Assign user to organization
        user.organization = organization
        if role:
            user.role = role
        user.save()

        role_text = f' with role {user.role}' if role else ''
        self.stdout.write(
            self.style.SUCCESS(f'Successfully assigned {user_email} to {org_name}{role_text}')
        )
