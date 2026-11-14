# accounts/serializers.py
import uuid
from django.contrib.auth import authenticate, get_user_model
from django.db import transaction
from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer

from .backends import normalize_mobile
from .models import CustomUser, AthleteProfile, ProfessionalProfile
from sports.models import Specialty
from sports.serializers import SpecialtySerializer

User = get_user_model()


def split_full_name(name):
    parts = (name or '').strip().split(None, 1)
    first_name = parts[0] if parts else ''
    last_name = parts[1] if len(parts) > 1 else ''
    return first_name, last_name


def generate_unique_username(email, mobile_number):
    base = (email.split('@')[0] if email else f"user_{mobile_number}")[:24]
    base = ''.join(ch for ch in base if ch.isalnum() or ch in ('_', '.')) or 'user'
    if not User.objects.filter(username=base).exists():
        return base
    return f"{base}_{uuid.uuid4().hex[:6]}"


class AthleteProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AthleteProfile
        fields = [
            'age', 'profession', 'address', 'pincode', 'additional_details',
            'date_of_birth', 'gender', 'city', 'state', 'preferred_language',
            'primary_sport', 'playing_role', 'secondary_role', 'club_name',
            'height', 'weight', 'batting_hand', 'bowling_style', 'preferred_position',
        ]


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    speciality = SpecialtySerializer(read_only=True)
    expertise = SpecialtySerializer(many=True, read_only=True)
    profile_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalProfile
        fields = [
            'speciality', 'expertise', 'institution_club', 'profile_photo',
            'profile_photo_url', 'is_certified', 'charges_per_session',
            'address', 'pincode', 'training_mode', 'is_available', 'additional_details',
            'academy_name', 'bank_details', 'session_price',
        ]

    def get_profile_photo_url(self, obj):
        if obj.profile_photo_url:
            return obj.profile_photo_url
        if obj.profile_photo:
            request = self.context.get('request')
            url = obj.profile_photo.url
            return request.build_absolute_uri(url) if request else url
        return ''


class UserSerializer(serializers.ModelSerializer):
    """Master user payload including role-specific profile data."""
    name = serializers.SerializerMethodField()
    athlete_profile = AthleteProfileSerializer(read_only=True)
    professional_profile = ProfessionalProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'name', 'email', 'mobile_number',
            'first_name', 'last_name', 'role', 'avatar', 'dob', 'blood_type',
            'athlete_profile', 'professional_profile',
        ]

    def get_name(self, obj):
        return obj.get_full_name() or obj.username


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    athlete_profile = AthleteProfileSerializer(required=False)
    professional_profile = ProfessionalProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'name', 'email', 'mobile_number',
            'first_name', 'last_name', 'role', 'avatar', 'dob', 'blood_type',
            'athlete_profile', 'professional_profile',
        ]
        read_only_fields = ['id', 'username', 'role']

    def get_name(self, obj):
        return obj.get_full_name() or obj.username

    def update(self, instance, validated_data):
        athlete_profile_data = validated_data.pop('athlete_profile', None)
        user = super().update(instance, validated_data)
        if athlete_profile_data is not None:
            profile, _ = AthleteProfile.objects.get_or_create(user=user)
            for attr, val in athlete_profile_data.items():
                setattr(profile, attr, val)
            profile.save()
        return user


class UnifiedLoginSerializer(serializers.Serializer):
    """Accepts email, mobile_number, or username via `identifier` (or `username`/`email`)."""
    identifier = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        login_id = (
            attrs.get('identifier')
            or attrs.get('username')
            or attrs.get('email')
            or ''
        ).strip()
        password = attrs.get('password')

        if not login_id or not password:
            raise serializers.ValidationError({'detail': 'Email/Mobile number and password are required.'})

        user = authenticate(
            request=self.context.get('request'),
            identifier=login_id,
            password=password,
        )
        if not user:
            raise serializers.ValidationError({'detail': 'Invalid email/mobile number or password.'})
        if not user.is_active:
            raise serializers.ValidationError({'detail': 'This account is inactive or suspended.'})

        attrs['user'] = user
        return attrs


class BaseRoleRegisterSerializer(serializers.Serializer):
    """Shared registration validation for Athlete & Coach onboarding."""
    name = serializers.CharField(max_length=150)
    mobile_number = serializers.CharField(max_length=15)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    address = serializers.CharField(required=False, allow_blank=True, default='')
    pincode = serializers.CharField(max_length=10)
    additional_details = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_mobile_number(self, value):
        mobile = normalize_mobile(value)
        if len(mobile) < 10:
            raise serializers.ValidationError('Please enter a valid 10-digit mobile number.')
        if User.objects.filter(mobile_number=mobile).exists():
            raise serializers.ValidationError('An account with this mobile number already exists.')
        return mobile

    def _create_base_user(self, validated_data, role):
        first_name, last_name = split_full_name(validated_data['name'])
        email = validated_data['email']
        mobile = validated_data['mobile_number']
        username = generate_unique_username(email, mobile)
        return User.objects.create_user(
            username=username,
            email=email,
            mobile_number=mobile,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
            role=role,
        )


class AthleteRegisterSerializer(BaseRoleRegisterSerializer):
    age = serializers.IntegerField(min_value=5, max_value=100)
    profession = serializers.CharField(max_length=120)

    @transaction.atomic
    def create(self, validated_data):
        user = self._create_base_user(validated_data, CustomUser.Role.ATHLETE)
        profile, _ = AthleteProfile.objects.get_or_create(user=user)
        profile.age = validated_data['age']
        profile.profession = validated_data['profession']
        profile.address = validated_data.get('address', '')
        profile.pincode = validated_data['pincode']
        profile.additional_details = validated_data.get('additional_details', '')
        profile.save()
        user.refresh_from_db()
        return user


class CoachRegisterSerializer(BaseRoleRegisterSerializer):
    institution_club = serializers.CharField(max_length=150, required=False, allow_blank=True, allow_null=True)
    expertise = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )
    profile_photo = serializers.ImageField(required=False, allow_null=True)
    profile_photo_url = serializers.URLField(required=False, allow_blank=True, default='')
    is_certified = serializers.BooleanField(required=False, default=False)
    is_available = serializers.BooleanField(required=False, default=True)
    training_mode = serializers.ChoiceField(
        choices=ProfessionalProfile.TrainingMode.choices,
        default=ProfessionalProfile.TrainingMode.BOTH,
    )
    charges_per_session = serializers.DecimalField(max_digits=8, decimal_places=2, min_value=0)

    def _resolve_expertise(self, raw_values):
        """Accepts Specialty IDs or exact category names (including comma-separated multipart strings)."""
        tokens = []
        for item in raw_values:
            for part in str(item).split(','):
                part = part.strip()
                if part:
                    tokens.append(part)
        resolved = []
        for token in tokens:
            if token.isdigit():
                spec = Specialty.objects.filter(id=int(token)).first()
            else:
                spec = Specialty.objects.filter(name__iexact=token).first()
            if spec:
                resolved.append(spec)
        return resolved

    @transaction.atomic
    def create(self, validated_data):
        user = self._create_base_user(validated_data, CustomUser.Role.PROFESSIONAL)
        profile, _ = ProfessionalProfile.objects.get_or_create(user=user)

        profile.institution_club = validated_data.get('institution_club') or ''
        profile.is_certified = validated_data.get('is_certified', False)
        profile.is_available = validated_data.get('is_available', True)
        profile.training_mode = validated_data.get('training_mode', ProfessionalProfile.TrainingMode.BOTH)
        profile.charges_per_session = validated_data['charges_per_session']
        profile.session_price = validated_data['charges_per_session']
        profile.address = validated_data.get('address', '')
        profile.pincode = validated_data['pincode']
        profile.additional_details = validated_data.get('additional_details', '')

        photo = validated_data.get('profile_photo')
        if photo:
            profile.profile_photo = photo
        if validated_data.get('profile_photo_url'):
            profile.profile_photo_url = validated_data['profile_photo_url']

        profile.save()

        if photo and not profile.profile_photo_url:
            request = self.context.get('request')
            url = profile.profile_photo.url
            profile.profile_photo_url = request.build_absolute_uri(url) if request else url
            profile.save(update_fields=['profile_photo_url'])

        specs = self._resolve_expertise(validated_data.get('expertise', []))
        if specs:
            profile.expertise.set(specs)
            profile.speciality = specs[0]
            profile.save(update_fields=['speciality'])

        user.refresh_from_db()
        return user


class CustomRegisterSerializer(RegisterSerializer):
    """Legacy dj-rest-auth register serializer retained for backward compatibility."""
    role = serializers.CharField(max_length=20, required=False)
    speciality_id = serializers.IntegerField(required=False, allow_null=True)

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data['role'] = self.validated_data.get('role', 'ATHLETE')
        data['speciality_id'] = self.validated_data.get('speciality_id')
        return data

    def save(self, request):
        user = super().save(request)
        user.role = self.cleaned_data.get('role')
        speciality_id = self.cleaned_data.get('speciality_id')
        if speciality_id:
            user._speciality_id = speciality_id
        user.save()
        return user


class CoachDirectorySerializer(serializers.ModelSerializer):
    """Public/Search feed representation of a Coach/Trainer."""
    coach_id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    mobile_number = serializers.CharField(source='user.mobile_number', read_only=True)
    expertise = SpecialtySerializer(many=True, read_only=True)
    speciality = SpecialtySerializer(read_only=True)
    profile_photo_url = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()

    class Meta:
        model = ProfessionalProfile
        fields = [
            'coach_id', 'username', 'name', 'email', 'mobile_number',
            'institution_club', 'expertise', 'speciality',
            'profile_photo_url', 'is_certified', 'charges_per_session',
            'address', 'pincode', 'training_mode', 'is_available',
            'additional_details', 'rating', 'reviews_count',
        ]

    def get_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

    def get_profile_photo_url(self, obj):
        if obj.profile_photo_url:
            return obj.profile_photo_url
        if obj.profile_photo:
            request = self.context.get('request')
            url = obj.profile_photo.url
            return request.build_absolute_uri(url) if request else url
        return ''

    def get_rating(self, obj):
        reviews = obj.user.reviews_received.all()
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return None

    def get_reviews_count(self, obj):
        return obj.user.reviews_received.count()


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin user & access management serializer."""
    athlete_profile = AthleteProfileSerializer(read_only=True)
    professional_profile = ProfessionalProfileSerializer(read_only=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    speciality_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    academy_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    institution_club = serializers.CharField(write_only=True, required=False, allow_blank=True)
    session_price = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    charges_per_session = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    playing_role = serializers.CharField(write_only=True, required=False, allow_blank=True)
    club_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'mobile_number', 'first_name', 'last_name',
            'role', 'is_active', 'date_joined', 'last_login',
            'password', 'speciality_id', 'academy_name', 'institution_club',
            'session_price', 'charges_per_session', 'playing_role', 'club_name',
            'athlete_profile', 'professional_profile',
        ]
        read_only_fields = ['id', 'date_joined', 'last_login']

    def create(self, validated_data):
        password = validated_data.pop('password', 'password123') or 'password123'
        speciality_id = validated_data.pop('speciality_id', None)
        academy_name = validated_data.pop('academy_name', '')
        institution_club = validated_data.pop('institution_club', '') or academy_name
        charges = validated_data.pop('charges_per_session', None) or validated_data.pop('session_price', 1000.00)
        playing_role = validated_data.pop('playing_role', 'Batsman')
        club_name = validated_data.pop('club_name', '')

        user = User.objects.create_user(password=password, **validated_data)

        if user.role == 'PROFESSIONAL':
            pro, _ = ProfessionalProfile.objects.get_or_create(user=user)
            if speciality_id:
                pro.speciality_id = speciality_id
                pro.expertise.add(speciality_id)
            if institution_club:
                pro.institution_club = institution_club
                pro.academy_name = institution_club
            if charges is not None:
                pro.charges_per_session = charges
                pro.session_price = charges
            pro.save()
        elif user.role == 'ATHLETE':
            ath, _ = AthleteProfile.objects.get_or_create(user=user)
            if playing_role:
                ath.playing_role = playing_role
            if club_name:
                ath.club_name = club_name
            ath.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        if password:
            instance.set_password(password)

        new_role = validated_data.get('role', instance.role)
        if new_role == 'PROFESSIONAL':
            ProfessionalProfile.objects.get_or_create(user=instance)
        elif new_role == 'ATHLETE':
            AthleteProfile.objects.get_or_create(user=instance)

        return super().update(instance, validated_data)
