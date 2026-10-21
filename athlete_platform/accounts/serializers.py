# accounts/serializers.py
from rest_framework import serializers
from .models import CustomUser, AthleteProfile, ProfessionalProfile
from sports.serializers import SpecialtySerializer
from django.contrib.auth import get_user_model
from dj_rest_auth.registration.serializers import RegisterSerializer

User = get_user_model()

class AthleteProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AthleteProfile
        fields = [
            'date_of_birth', 'age', 'gender', 'city', 'state', 'preferred_language',
            'primary_sport', 'playing_role', 'secondary_role', 'club_name',
            'height', 'weight', 'batting_hand', 'bowling_style', 'preferred_position'
        ]

class ProfessionalProfileSerializer(serializers.ModelSerializer):
    speciality = SpecialtySerializer(read_only=True)
    
    class Meta:
        model = ProfessionalProfile
        fields = ['speciality', 'is_certified', 'address', 'academy_name', 'bank_details', 'session_price']

class UserSerializer(serializers.ModelSerializer):
    """
    The master user payload. It conditionally includes profile data based on the user's role.
    """
    athlete_profile = AthleteProfileSerializer(read_only=True)
    professional_profile = ProfessionalProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'avatar', 'dob', 'blood_type',
            'athlete_profile', 'professional_profile'
        ]

class UserProfileSerializer(serializers.ModelSerializer):
    athlete_profile = AthleteProfileSerializer(required=False)
    professional_profile = ProfessionalProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'avatar', 'dob', 'blood_type',
            'athlete_profile', 'professional_profile'
        ]
        read_only_fields = ['id', 'username', 'role']

    def update(self, instance, validated_data):
        athlete_profile_data = validated_data.pop('athlete_profile', None)
        user = super().update(instance, validated_data)

        if athlete_profile_data is not None:
            profile, _ = AthleteProfile.objects.get_or_create(user=user)
            for attr, val in athlete_profile_data.items():
                setattr(profile, attr, val)
            profile.save()

        return user

class CustomRegisterSerializer(RegisterSerializer):
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
