import os
import django
from datetime import date, time, timedelta
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import CustomUser, AthleteProfile, ProfessionalProfile
from sports.models import Sport, Specialty
from bookings.models import AvailabilitySlot, Booking, Review
from performance.models import DailyLog, CricketPerformance

User = get_user_model()
COMMON_PASSWORD = 'password123'

def seed():
    print("=== SEEDING REALISTIC CRICKET ATHLETE & COACH DATA ===")

    # 1. Ensure Sport
    cricket, _ = Sport.objects.get_or_create(name='Cricket')

    # 2. Ensure Specialties
    specialties_data = [
        'Top-Order Batting Coach',
        'Power Hitting & Spin Specialist',
        'Fast & Medium Pace Bowling Coach',
        'Spin Bowling & Variations Mentor',
        'Fielding & Wicketkeeping Coach',
        'Cricket Strength & Conditioning Coach'
    ]

    specialties = {}
    for name in specialties_data:
        spec, _ = Specialty.objects.get_or_create(
            name=name,
            sport=cricket
        )
        specialties[name] = spec
    print(f"Verified {len(specialties)} cricket coaching specialties.")

    # 3. Create Admin Users (both 'admin' and 'admin_test')
    for admin_name in ['admin', 'admin_test']:
        adm, _ = User.objects.get_or_create(
            username=admin_name,
            defaults={'email': f'{admin_name}@dronamate.in', 'role': 'ADMIN'}
        )
        adm.role = 'ADMIN'
        adm.set_password(COMMON_PASSWORD)
        adm.is_superuser = True
        adm.is_staff = True
        adm.save()
    print("Admin accounts verified: admin, admin_test")

    # 4. Create Coaches
    coaches_data = [
        {
            'username': 'coach_rahul',
            'first_name': 'Rahul',
            'last_name': 'Dravid',
            'email': 'rahul.coach@dronamate.in',
            'specialty': specialties['Top-Order Batting Coach'],
            'price': 1500.00,
            'academy': 'National Cricket Academy, Bangalore',
            'address': 'Chinnaswamy Stadium Complex, Bangalore'
        },
        {
            'username': 'coach_vikram',
            'first_name': 'Vikram',
            'last_name': 'Rathour',
            'email': 'vikram.coach@dronamate.in',
            'specialty': specialties['Power Hitting & Spin Specialist'],
            'price': 1200.00,
            'academy': 'North Zone High Performance Academy',
            'address': 'Feroz Shah Kotla Enclave, New Delhi'
        },
        {
            'username': 'coach_arun',
            'first_name': 'Bharat',
            'last_name': 'Arun',
            'email': 'arun.coach@dronamate.in',
            'specialty': specialties['Fast & Medium Pace Bowling Coach'],
            'price': 1800.00,
            'academy': 'MRF Pace & Bowling Academy',
            'address': 'Chepauk Training Ground, Chennai'
        },
        {
            'username': 'pro_test',
            'first_name': 'Sanjay',
            'last_name': 'Bangar',
            'email': 'pro@dronamate.in',
            'specialty': specialties['Top-Order Batting Coach'],
            'price': 1000.00,
            'academy': 'DronaMate Elite Cricket Academy',
            'address': 'Ground 3, Net Complex, Sector 21'
        }
    ]

    coach_objs = []
    for cdata in coaches_data:
        cuser, _ = User.objects.get_or_create(
            username=cdata['username'],
            defaults={
                'email': cdata['email'],
                'first_name': cdata['first_name'],
                'last_name': cdata['last_name'],
                'role': 'PROFESSIONAL'
            }
        )
        cuser.set_password(COMMON_PASSWORD)
        cuser.first_name = cdata['first_name']
        cuser.last_name = cdata['last_name']
        cuser.save()

        cprof, _ = ProfessionalProfile.objects.get_or_create(user=cuser)
        cprof.speciality = cdata['specialty']
        cprof.session_price = cdata['price']
        cprof.is_certified = True
        cprof.academy_name = cdata['academy']
        cprof.address = cdata['address']
        cprof.save()
        coach_objs.append(cuser)
        print(f"Coach verified: {cuser.username} ({cdata['specialty'].name})")

    # 5. Create Availability Slots for Coaches
    today = date.today()
    slots = []
    for coach in coach_objs:
        for day_offset in [1, 2, 4, 6]:
            slot_date = today + timedelta(days=day_offset)
            
            # Morning online slot
            s1, _ = AvailabilitySlot.objects.get_or_create(
                professional=coach,
                date=slot_date,
                start_time=time(9, 30),
                defaults={
                    'end_time': time(10, 30),
                    'session_type': 'ONLINE',
                    'price': coach.professional_profile.session_price,
                    'max_capacity': 1,
                    'meeting_link_or_address': f'https://meet.google.com/dronamate-{coach.username}-session'
                }
            )
            slots.append(s1)

            # Evening offline net slot
            s2, _ = AvailabilitySlot.objects.get_or_create(
                professional=coach,
                date=slot_date,
                start_time=time(16, 0),
                defaults={
                    'end_time': time(17, 30),
                    'session_type': 'OFFLINE',
                    'price': coach.professional_profile.session_price,
                    'max_capacity': 2,
                    'meeting_link_or_address': coach.professional_profile.address
                }
            )
            slots.append(s2)
    print(f"Generated {len(slots)} availability slots for coaches.")

    # 6. Create Realistic Athletes
    athletes_data = [
        {
            'username': 'athlete_1',
            'first_name': 'Aryan',
            'last_name': 'Sharma',
            'email': 'aryan.sharma@example.com',
            'playing_role': 'Batsman',
            'secondary_role': 'Bowler',
            'club_name': 'Shivaji Park Gymkhana, Mumbai',
            'age': 21,
            'height': '178 cm',
            'weight': '74 kg',
            'batting_hand': 'Right-hand bat',
            'bowling_style': 'Right-arm medium fast',
            'preferred_position': 'Top-Order Batsman',
            'stats': {
                'matches': 24,
                'innings': 22,
                'runs': 948,
                'highest_score': '114*',
                'average': 47.40,
                'strike_rate': 136.8,
                'centuries': 2,
                'half_centuries': 6,
                'fours': 98,
                'sixes': 32,
                'wickets': 4,
                'not_outs': 2,
                'balls_faced_medium_fast': 412,
                'runs_scored_medium_fast': 535,
                'dismissals_medium_fast': 11,
                'balls_faced_spin': 281,
                'runs_scored_spin': 413,
                'dismissals_spin': 7,
                'notes': 'Solid technique against 135+ kmph pace bowling. Excels at cover drive and pull shot.'
            }
        },
        {
            'username': 'athlete_2',
            'first_name': 'Kabir',
            'last_name': 'Verma',
            'email': 'kabir.verma@example.com',
            'playing_role': 'Batsman',
            'secondary_role': 'None',
            'club_name': 'Delhi Colts Cricket Academy',
            'age': 19,
            'height': '175 cm',
            'weight': '68 kg',
            'batting_hand': 'Left-hand bat',
            'bowling_style': 'Right-arm off break',
            'preferred_position': 'Opening Batsman',
            'stats': {
                'matches': 18,
                'innings': 18,
                'runs': 765,
                'highest_score': '89',
                'average': 42.50,
                'strike_rate': 142.2,
                'centuries': 0,
                'half_centuries': 7,
                'fours': 84,
                'sixes': 28,
                'wickets': 1,
                'not_outs': 0,
                'balls_faced_medium_fast': 320,
                'runs_scored_medium_fast': 450,
                'dismissals_medium_fast': 10,
                'balls_faced_spin': 218,
                'runs_scored_spin': 315,
                'dismissals_spin': 6,
                'notes': 'High-impact powerplay opener. Fast hands and exceptional sweep shot against left-arm spin.'
            }
        },
        {
            'username': 'athlete_test',
            'first_name': 'Rohan',
            'last_name': 'Iyer',
            'email': 'athlete@dronamate.in',
            'playing_role': 'Batsman',
            'secondary_role': 'Bowler',
            'club_name': 'Karnataka State Cricket Academy',
            'age': 22,
            'height': '180 cm',
            'weight': '75 kg',
            'batting_hand': 'Right-hand bat',
            'bowling_style': 'Right-arm medium',
            'preferred_position': 'Top-Order Batsman',
            'stats': {
                'matches': 16,
                'innings': 15,
                'runs': 620,
                'highest_score': '95*',
                'average': 47.69,
                'strike_rate': 139.5,
                'centuries': 1,
                'half_centuries': 4,
                'fours': 62,
                'sixes': 22,
                'wickets': 3,
                'not_outs': 2,
                'balls_faced_medium_fast': 260,
                'runs_scored_medium_fast': 355,
                'dismissals_medium_fast': 6,
                'balls_faced_spin': 184,
                'runs_scored_spin': 265,
                'dismissals_spin': 5,
                'notes': 'Quick between the wickets. High conversion rate of 30s into match-winning 50s.'
            }
        }
    ]

    athlete_objs = []
    for adata in athletes_data:
        auser, _ = User.objects.get_or_create(
            username=adata['username'],
            defaults={
                'email': adata['email'],
                'first_name': adata['first_name'],
                'last_name': adata['last_name'],
                'role': 'ATHLETE'
            }
        )
        auser.set_password(COMMON_PASSWORD)
        auser.first_name = adata['first_name']
        auser.last_name = adata['last_name']
        auser.save()

        # Update profile
        aprof, _ = AthleteProfile.objects.get_or_create(user=auser)
        aprof.playing_role = adata['playing_role']
        aprof.secondary_role = adata['secondary_role']
        aprof.club_name = adata['club_name']
        aprof.age = adata['age']
        aprof.height = adata['height']
        aprof.weight = adata['weight']
        aprof.batting_hand = adata['batting_hand']
        aprof.bowling_style = adata['bowling_style']
        aprof.preferred_position = adata['preferred_position']
        aprof.primary_sport = 'Cricket'
        aprof.city = 'Mumbai' if 'Mumbai' in adata['club_name'] else 'New Delhi' if 'Delhi' in adata['club_name'] else 'Bangalore'
        aprof.save()

        # Update or create Cricket Performance
        s = adata['stats']
        cperf, _ = CricketPerformance.objects.get_or_create(athlete=auser)
        cperf.matches_played = s['matches']
        cperf.innings = s['innings']
        cperf.runs_made = s['runs']
        cperf.highest_score = s['highest_score']
        cperf.batting_average = s['average']
        cperf.strike_rate = s['strike_rate']
        cperf.centuries = s['centuries']
        cperf.half_centuries = s['half_centuries']
        cperf.fours = s['fours']
        cperf.sixes = s['sixes']
        cperf.wickets = s['wickets']
        cperf.not_outs = s['not_outs']
        cperf.balls_faced_medium_fast = s['balls_faced_medium_fast']
        cperf.runs_scored_medium_fast = s['runs_scored_medium_fast']
        cperf.dismissals_medium_fast = s['dismissals_medium_fast']
        cperf.balls_faced_spin = s['balls_faced_spin']
        cperf.runs_scored_spin = s['runs_scored_spin']
        cperf.dismissals_spin = s['dismissals_spin']
        cperf.notes = s['notes']
        cperf.save()

        # Create daily performance logs (last 7 days)
        for days_back in range(7, 0, -1):
            log_date = today - timedelta(days=days_back)
            DailyLog.objects.get_or_create(
                athlete=auser,
                date=log_date,
                defaults={
                    'sleep_hours': round(random.uniform(7.0, 8.5), 1),
                    'training_duration_mins': random.choice([60, 90, 105, 120]),
                    'perceived_exertion': random.randint(5, 8),
                    'fatigue_level': random.randint(2, 5),
                    'muscle_soreness': random.randint(2, 4),
                    'stress_level': random.randint(2, 4),
                    'resting_heart_rate': random.randint(56, 64),
                    'hydration_liters': round(random.uniform(3.0, 4.2), 1),
                    'diet_quality': random.randint(8, 10)
                }
            )

        athlete_objs.append(auser)
        print(f"Athlete verified: {auser.username} ({adata['first_name']} {adata['last_name']}) with cricket batsman stats and 7 days logs.")

    # 7. Create Bookings & Reviews
    if coach_objs and athlete_objs and slots:
        b1, _ = Booking.objects.get_or_create(
            athlete=athlete_objs[0],
            slot=slots[0],
            defaults={
                'current_goal': 'Improve trigger movement and back-foot punch against express pace.',
                'past_injury': 'None',
                'payment_status': 'PAID',
                'razorpay_order_id': 'order_dummy_001'
            }
        )

        b2, _ = Booking.objects.get_or_create(
            athlete=athlete_objs[1],
            slot=slots[1],
            defaults={
                'current_goal': 'Sharpen sweep and reverse sweep shot against left-arm orthodox spin.',
                'past_injury': 'Mild right hamstring strain (fully recovered)',
                'payment_status': 'PAID',
                'razorpay_order_id': 'order_dummy_002'
            }
        )

        b3, _ = Booking.objects.get_or_create(
            athlete=athlete_objs[2],
            slot=slots[2],
            defaults={
                'current_goal': 'Net session simulation: death overs boundary hitting.',
                'past_injury': 'None',
                'payment_status': 'PAID',
                'razorpay_order_id': 'order_dummy_003'
            }
        )

        # Reviews
        Review.objects.get_or_create(
            booking=b1,
            athlete=athlete_objs[0],
            professional=slots[0].professional,
            defaults={
                'rating': 5,
                'comment': 'Outstanding tactical session! Coach adjusted my head position right before the point of release.'
            }
        )

        Review.objects.get_or_create(
            booking=b2,
            athlete=athlete_objs[1],
            professional=slots[1].professional,
            defaults={
                'rating': 5,
                'comment': 'Brilliant net drills with spin variations. Highly recommend for any competitive opening batsman.'
            }
        )
        print("Created 3 active confirmed bookings and verified athlete reviews.")

    # 8. Write Clean Credentials File
    cred_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dummy_accounts.txt')
    with open(cred_file, 'w', encoding='utf-8') as f:
        f.write("=====================================================================\n")
        f.write("                DRONAMATE - DEMO & TESTING ACCOUNTS                  \n")
        f.write("=====================================================================\n")
        f.write(f"Common Password for all accounts: {COMMON_PASSWORD}\n\n")
        f.write("--- 1. CRICKET ATHLETES (BATSMEN) ---\n")
        for a in athletes_data:
            f.write(f"Username : {a['username']:<15} | Name: {a['first_name']} {a['last_name']} ({a['playing_role']}, {a['club_name']})\n")
        f.write("\n--- 2. COACHES & PROFESSIONALS ---\n")
        for c in coaches_data:
            f.write(f"Username : {c['username']:<15} | Name: {c['first_name']} {c['last_name']} ({c['specialty'].name})\n")
        f.write("\n--- 3. ADMINISTRATOR ---\n")
        f.write(f"Username : admin_test      | Email: admin@dronamate.in\n")
        f.write("=====================================================================\n")
    print(f"Updated credentials file at: {cred_file}")
    print("=== DUMMY DATA SEEDING COMPLETE ===")

if __name__ == '__main__':
    seed()
