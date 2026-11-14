# bookings/serializers.py
from rest_framework import serializers
from .models import AvailabilitySlot, Booking, Review, Notification


class AvailabilitySlotSerializer(serializers.ModelSerializer):
    professional_name = serializers.SerializerMethodField()
    professional_rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    current_enrollments = serializers.SerializerMethodField()
    professional_specialty = serializers.SerializerMethodField()
    professional_expertise = serializers.SerializerMethodField()
    professional_is_available = serializers.SerializerMethodField()
    professional_training_mode = serializers.SerializerMethodField()
    professional_is_certified = serializers.SerializerMethodField()
    professional_institution_club = serializers.SerializerMethodField()
    professional_pincode = serializers.SerializerMethodField()
    professional_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = AvailabilitySlot
        fields = [
            'id', 'professional', 'professional_name', 'professional_specialty',
            'professional_expertise', 'professional_is_available',
            'professional_training_mode', 'professional_is_certified',
            'professional_institution_club', 'professional_pincode',
            'professional_photo_url', 'professional_rating', 'reviews_count',
            'date', 'start_time', 'end_time', 'session_type', 'max_capacity',
            'current_enrollments', 'meeting_link_or_address', 'price', 'is_cancelled',
        ]
        read_only_fields = ['professional', 'current_enrollments', 'is_cancelled']

    def _get_pro_profile(self, obj):
        return getattr(obj.professional, 'professional_profile', None)

    def get_professional_name(self, obj):
        return obj.professional.get_full_name() or obj.professional.username

    def get_professional_rating(self, obj):
        reviews = obj.professional.reviews_received.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None

    def get_reviews_count(self, obj):
        return obj.professional.reviews_received.count()

    def get_current_enrollments(self, obj):
        return obj.booking_record.filter(payment_status='PAID').count()

    def get_professional_specialty(self, obj):
        profile = self._get_pro_profile(obj)
        if not profile:
            return "Coach / Trainer"
        if profile.speciality:
            return profile.speciality.name
        first_exp = profile.expertise.first()
        return first_exp.name if first_exp else "Coach / Trainer"

    def get_professional_expertise(self, obj):
        profile = self._get_pro_profile(obj)
        if not profile:
            return []
        names = list(profile.expertise.values_list('name', flat=True))
        if not names and profile.speciality:
            names = [profile.speciality.name]
        return names

    def get_professional_is_available(self, obj):
        profile = self._get_pro_profile(obj)
        return profile.is_available if profile else True

    def get_professional_training_mode(self, obj):
        profile = self._get_pro_profile(obj)
        return profile.training_mode if profile else 'Both'

    def get_professional_is_certified(self, obj):
        profile = self._get_pro_profile(obj)
        return profile.is_certified if profile else False

    def get_professional_institution_club(self, obj):
        profile = self._get_pro_profile(obj)
        return (profile.institution_club or profile.academy_name) if profile else ''

    def get_professional_pincode(self, obj):
        profile = self._get_pro_profile(obj)
        return profile.pincode if profile else ''

    def get_professional_photo_url(self, obj):
        profile = self._get_pro_profile(obj)
        if not profile:
            return ''
        if profile.profile_photo_url:
            return profile.profile_photo_url
        if profile.profile_photo:
            request = self.context.get('request')
            url = profile.profile_photo.url
            return request.build_absolute_uri(url) if request else url
        return ''


class BookingSerializer(serializers.ModelSerializer):
    slot_details = AvailabilitySlotSerializer(source='slot', read_only=True)
    athlete_name = serializers.SerializerMethodField()
    has_reviewed = serializers.SerializerMethodField()
    date = serializers.CharField(source='slot.date', read_only=True)
    start_time = serializers.CharField(source='slot.start_time', read_only=True)
    end_time = serializers.CharField(source='slot.end_time', read_only=True)
    session_type = serializers.CharField(source='slot.session_type', read_only=True)
    meeting_link_or_address = serializers.CharField(source='slot.meeting_link_or_address', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'athlete', 'athlete_name', 'slot', 'slot_details', 'current_goal',
            'past_injury', 'payment_status', 'razorpay_order_id',
            'created_at', 'has_reviewed', 'date', 'start_time', 'end_time',
            'session_type', 'meeting_link_or_address',
        ]
        read_only_fields = [
            'athlete', 'payment_status', 'razorpay_order_id', 'has_reviewed',
            'date', 'start_time', 'end_time', 'session_type', 'meeting_link_or_address',
        ]

    def get_athlete_name(self, obj):
        return obj.athlete.get_full_name() or obj.athlete.username

    def get_has_reviewed(self, obj):
        return hasattr(obj, 'review')


class ReviewSerializer(serializers.ModelSerializer):
    athlete_name = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'booking', 'athlete', 'athlete_name', 'professional', 'rating', 'comment', 'created_at']
        read_only_fields = ['athlete', 'professional']

    def get_athlete_name(self, obj):
        return obj.athlete.get_full_name() or obj.athlete.username


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'is_read', 'created_at']
