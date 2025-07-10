from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Organization

User = get_user_model()


class Command(BaseCommand):
    help = 'Create an organization and assign users to it'

    def add_arguments(self, parser):
        parser.add_argument('organization_name', type=str, help='Name of the organization')
        parser.add_argument('--description', type=str, help='Description of the organization', default='')
        parser.add_argument('--admin-email', type=str, help='Email of the admin user to assign to this organization')

    def handle(self, *args, **options):
        org_name = options['organization_name']
        description = options['description']
        admin_email = options.get('admin_email')

        # Create organization
        organization, created = Organization.objects.get_or_create(
            name=org_name,
            defaults={'description': description}
        )

        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created organization: {org_name}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Organization already exists: {org_name}')
            )

        # Assign admin user if provided
        if admin_email:
            try:
                admin_user = User.objects.get(email=admin_email)
                admin_user.organization = organization
                admin_user.role = 'admin'  # Make them admin
                admin_user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Assigned {admin_email} as admin to {org_name}')
                )
            except User.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'User with email {admin_email} not found')
                )

        self.stdout.write(f'Organization ID: {organization.id}')
