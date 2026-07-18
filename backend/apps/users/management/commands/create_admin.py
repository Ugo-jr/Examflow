from django.core.management.base import BaseCommand
from apps.users.models import User

class Command(BaseCommand):
    help = 'Create default admin user'

    def handle(self, *args, **kwargs):
        email = 'admin@examflow.com'
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(
                email=email,
                password='admin1234',
                first_name='Admin',
                last_name='User',
                role='admin'
            )
            self.stdout.write(self.style.SUCCESS('Admin user created successfully!'))
        else:
            self.stdout.write('Admin user already exists.')