import io
from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import AthleteProfile, ProfessionalProfile
from sports.models import Sport, Specialty

User = get_user_model()


def make_test_image(name='coach.png'):
    file_obj = io.BytesIO()
    image = Image.new('RGB', (64, 64), color=(249, 115, 22))
    image.save(file_obj, 'PNG')
    file_obj.seek(0)
    return SimpleUploadedFile(name, file_obj.read(), content_type='image/png')


class AuthOnboardingAndAvailabilityTests(APITestCase):
    def setUp(self):
        self.cricket, _ = Sport.objects.get_or_create(name='Cricket')
        self.cat_cricket, _ = Specialty.objects.get_or_create(
            name='Cricket (Batting and bowling)',
            defaults={'sport': self.cricket, 'is_cross_sport': False},
        )
        self.cat_fitness, _ = Specialty.objects.get_or_create(
            name='Fitness',
            defaults={'is_cross_sport': True},
        )

    def test_athlete_registration_and_unified_email_or_mobile_login(self):
        payload = {
            'name': 'Rohan Sharma',
            'mobile_number': '9876543210',
            'email': 'rohan@example.com',
            'password': 'password123',
            'age': 21,
            'profession': 'College Cricketer',
            'address': '14 MG Road, Mumbai',
            'pincode': '400001',
            'additional_details': 'Looking for batting sessions',
        }
        res = self.client.post('/api/auth/register/athlete/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertIn('access', res.data)
        self.assertEqual(res.data['user']['role'], 'ATHLETE')
        self.assertEqual(res.data['user']['athlete_profile']['pincode'], '400001')
        self.assertEqual(res.data['user']['athlete_profile']['profession'], 'College Cricketer')

        # Login with Email
        email_login = self.client.post('/api/auth/login/', {
            'identifier': 'rohan@example.com',
            'password': 'password123',
        }, format='json')
        self.assertEqual(email_login.status_code, status.HTTP_200_OK, email_login.data)
        self.assertIn('access', email_login.data)

        # Login with Mobile Number
        mobile_login = self.client.post('/api/auth/login/', {
            'identifier': '9876543210',
            'password': 'password123',
        }, format='json')
        self.assertEqual(mobile_login.status_code, status.HTTP_200_OK, mobile_login.data)
        self.assertIn('access', mobile_login.data)

    def test_coach_registration_with_photo_upload_and_expertise(self):
        payload = {
            'name': 'Vikram Coach',
            'mobile_number': '9123456789',
            'email': 'vikram.trainer@example.com',
            'password': 'password123',
            'institution_club': 'Delhi Cricket Club',
            'expertise': [self.cat_cricket.id, self.cat_fitness.id],
            'profile_photo': make_test_image(),
            'is_certified': True,
            'is_available': True,
            'training_mode': 'Both',
            'charges_per_session': '1500.00',
            'address': 'Sector 18, Noida',
            'pincode': '201301',
            'additional_details': 'BCCI Level 2 Certified',
        }
        res = self.client.post('/api/auth/register/coach/', payload, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertIn('access', res.data)
        user_data = res.data['user']
        self.assertEqual(user_data['role'], 'PROFESSIONAL')
        pro = user_data['professional_profile']
        self.assertEqual(pro['institution_club'], 'Delhi Cricket Club')
        self.assertEqual(pro['pincode'], '201301')
        self.assertEqual(pro['training_mode'], 'Both')
        self.assertTrue(pro['is_certified'])
        self.assertTrue(pro['is_available'])
        self.assertTrue(pro['profile_photo_url'])
        self.assertEqual(len(pro['expertise']), 2)

    def test_coach_availability_toggle_permissions(self):
        coach = User.objects.create_user(
            username='coach_avail',
            email='coach_avail@example.com',
            mobile_number='9000000001',
            password='password123',
            role='PROFESSIONAL',
        )
        other_coach = User.objects.create_user(
            username='other_coach',
            email='other_coach@example.com',
            mobile_number='9000000002',
            password='password123',
            role='PROFESSIONAL',
        )
        athlete = User.objects.create_user(
            username='ath_avail',
            email='ath_avail@example.com',
            mobile_number='9000000003',
            password='password123',
            role='ATHLETE',
        )
        admin = User.objects.create_user(
            username='adm_avail',
            email='adm_avail@example.com',
            mobile_number='9000000004',
            password='password123',
            role='ADMIN',
            is_staff=True,
        )

        # Athlete is forbidden
        self.client.force_authenticate(user=athlete)
        res = self.client.patch('/api/coach/availability', {'is_available': False}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Other coach cannot toggle another coach
        self.client.force_authenticate(user=other_coach)
        res = self.client.patch(
            '/api/coach/availability',
            {'coach_id': coach.id, 'is_available': False},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Coach can toggle own availability
        self.client.force_authenticate(user=coach)
        res = self.client.patch('/api/coach/availability', {'is_available': False}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        coach.professional_profile.refresh_from_db()
        self.assertFalse(coach.professional_profile.is_available)

        # Admin can toggle target coach availability
        self.client.force_authenticate(user=admin)
        res = self.client.put(
            '/api/coach/availability',
            {'coach_id': coach.id, 'is_available': True},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        coach.professional_profile.refresh_from_db()
        self.assertTrue(coach.professional_profile.is_available)
