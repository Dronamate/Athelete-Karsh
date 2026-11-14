from datetime import date, time, timedelta
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from bookings.models import AvailabilitySlot
from sports.models import Specialty

User = get_user_model()


class CoachSearchAndBookingAvailabilityTests(APITestCase):
    def setUp(self):
        self.cat_cricket, _ = Specialty.objects.get_or_create(name='Cricket (Batting and bowling)')
        self.cat_yoga, _ = Specialty.objects.get_or_create(name='Yoga and Meditation', defaults={'is_cross_sport': True})

        self.coach_online = User.objects.create_user(
            username='coach_online',
            email='online@example.com',
            first_name='Anil',
            last_name='Kumble',
            password='password123',
            role='PROFESSIONAL',
        )
        pro1 = self.coach_online.professional_profile
        pro1.training_mode = 'Online'
        pro1.is_available = True
        pro1.charges_per_session = 1200
        pro1.speciality = self.cat_cricket
        pro1.save()
        pro1.expertise.add(self.cat_cricket)

        self.coach_offline_unavail = User.objects.create_user(
            username='coach_unavail',
            email='unavail@example.com',
            first_name='Yogesh',
            last_name='Verma',
            password='password123',
            role='PROFESSIONAL',
        )
        pro2 = self.coach_offline_unavail.professional_profile
        pro2.training_mode = 'Offline'
        pro2.is_available = False
        pro2.charges_per_session = 900
        pro2.speciality = self.cat_yoga
        pro2.save()
        pro2.expertise.add(self.cat_yoga)

        self.athlete = User.objects.create_user(
            username='athlete_booker',
            email='booker@example.com',
            password='password123',
            role='ATHLETE',
        )

        tomorrow = date.today() + timedelta(days=1)
        self.slot_avail = AvailabilitySlot.objects.create(
            professional=self.coach_online,
            date=tomorrow,
            start_time=time(10, 0),
            end_time=time(11, 0),
            session_type='ONLINE',
            price=1200,
        )
        self.slot_unavail = AvailabilitySlot.objects.create(
            professional=self.coach_offline_unavail,
            date=tomorrow,
            start_time=time(12, 0),
            end_time=time(13, 0),
            session_type='OFFLINE',
            price=900,
        )

    def test_coach_directory_filters_by_category_and_training_mode(self):
        res = self.client.get('/api/coaches/', {'category': 'Yoga and Meditation', 'training_mode': 'Offline'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['username'], 'coach_unavail')
        self.assertFalse(res.data[0]['is_available'])

        res_online = self.client.get('/api/coaches/', {'training_mode': 'Online'})
        self.assertEqual(res_online.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_online.data), 1)
        self.assertTrue(res_online.data[0]['is_available'])

    def test_booking_unavailable_coach_slot_is_rejected(self):
        self.client.force_authenticate(user=self.athlete)
        res = self.client.post('/api/bookings/', {
            'slot': self.slot_unavail.id,
            'current_goal': 'Flexibility',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        res_ok = self.client.post('/api/bookings/', {
            'slot': self.slot_avail.id,
            'current_goal': 'Spin bowling',
        }, format='json')
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)
