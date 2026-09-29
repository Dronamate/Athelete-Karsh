import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def create_users():
    password = 'TestPassword123!'
    
    # 1. Admin
    if not User.objects.filter(username='admin_test').exists():
        User.objects.create_superuser('admin_test', 'admin@dronamate.in', password)
        print("Created admin_test")

    # 2. Athlete
    if not User.objects.filter(username='athlete_test').exists():
        user = User.objects.create_user('athlete_test', 'athlete@dronamate.in', password)
        user.role = 'ATHLETE'
        user.save()
        print("Created athlete_test")

    # 3. Professional
    if not User.objects.filter(username='pro_test').exists():
        user = User.objects.create_user('pro_test', 'pro@dronamate.in', password)
        user.role = 'PROFESSIONAL'
        user.save()
        
        # Ensure specialty is assigned if needed (assuming '1' exists)
        from sports.models import Specialty
        spec = Specialty.objects.first()
        if spec and hasattr(user, 'professional_profile'):
            user.professional_profile.speciality = spec
            user.professional_profile.is_certified = True
            user.professional_profile.session_price = 1000.00
            user.professional_profile.save()
        print("Created pro_test")

if __name__ == '__main__':
    create_users()
