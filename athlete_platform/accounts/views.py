# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .serializers import UserProfileSerializer
from .models import AthleteProfile
from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from django.contrib.auth import get_user_model
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

User = get_user_model()

class AdminUserViewSet(viewsets.ModelViewSet):
    """Allows Admins to view, edit, and delete any user account on the platform."""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    
    
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Fetch the logged-in user's profile."""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update the logged-in user's profile and linked athlete profile."""
        data = request.data.copy()
        
        # Check if athlete profile fields were passed at top level
        athlete_fields = [
            'date_of_birth', 'age', 'gender', 'city', 'state', 'preferred_language',
            'primary_sport', 'playing_role', 'secondary_role', 'club_name',
            'height', 'weight', 'batting_hand', 'bowling_style', 'preferred_position'
        ]
        
        extracted_athlete_data = {}
        for field in athlete_fields:
            if field in data:
                extracted_athlete_data[field] = data.pop(field)[0] if isinstance(data[field], list) else data.pop(field)

        serializer = UserProfileSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            
            # If athlete, update or create AthleteProfile
            if user.role == 'ATHLETE' and extracted_athlete_data:
                profile, _ = AthleteProfile.objects.get_or_create(user=user)
                for key, val in extracted_athlete_data.items():
                    if val is not None and val != '':
                        if key == 'age':
                            try:
                                val = int(val)
                            except (ValueError, TypeError):
                                val = None
                        setattr(profile, key, val)
                profile.save()
                
            return Response(UserProfileSerializer(request.user).data)
        return Response(serializer.errors, status=400)


class GoogleLogin(SocialLoginView):
    """
    Handles Google OAuth login.
    """
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'postmessage'
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        print("--- GOOGLE LOGIN REQUEST DATA ---")
        print(request.data)
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code >= 400:
                print("--- GOOGLE LOGIN ERROR RESPONSE ---")
                print(response.data)
            return response
        except Exception as e:
            print("--- GOOGLE LOGIN EXCEPTION ---")
            print(str(e))
            raise
