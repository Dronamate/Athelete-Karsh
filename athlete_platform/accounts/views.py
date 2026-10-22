# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions, viewsets
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Q
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from django.contrib.auth import get_user_model
from .models import AthleteProfile, ProfessionalProfile
from .serializers import UserProfileSerializer, AdminUserSerializer

User = get_user_model()

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Enterprise-grade Admin User & Access Management:
    - Lists, filters, and searches users
    - Creates new accounts with role assignment
    - Updates user roles and profile assignments
    - Toggles active/suspended (ban) status
    - Direct password resets
    - User impersonation token generation
    - Summarizes user distribution metrics
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
        search = self.request.query_params.get('search', '').strip()
        role = self.request.query_params.get('role', '').strip()
        is_active = self.request.query_params.get('is_active', '').strip()

        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search)
            )
        if role and role in ['ATHLETE', 'PROFESSIONAL', 'ADMIN']:
            qs = qs.filter(role=role)
        if is_active in ['true', 'false']:
            qs = qs.filter(is_active=(is_active == 'true'))

        return qs

    @action(detail=True, methods=['post'])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password')
        if not new_password or len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({'message': f"Password for {user.username} was successfully reset to '{new_password}'."})

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            return Response({'error': 'You cannot ban or deactivate your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save()
        status_label = "Active" if user.is_active else "Suspended / Banned"
        return Response({
            'message': f"Account {user.username} is now {status_label}.",
            'is_active': user.is_active
        })

    @action(detail=True, methods=['post'])
    def impersonate(self, request, pk=None):
        user = self.get_object()
        refresh = RefreshToken.for_user(user)
        user_serializer = UserProfileSerializer(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data,
            'message': f"Impersonating {user.username} ({user.role})"
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total = User.objects.count()
        athletes = User.objects.filter(role='ATHLETE').count()
        professionals = User.objects.filter(role='PROFESSIONAL').count()
        admins = User.objects.filter(role='ADMIN').count()
        active = User.objects.filter(is_active=True).count()
        suspended = User.objects.filter(is_active=False).count()
        return Response({
            'total_users': total,
            'total_athletes': athletes,
            'total_professionals': professionals,
            'total_admins': admins,
            'active_users': active,
            'suspended_users': suspended
        })
    
    
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Fetch the logged-in user's profile."""
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update the logged-in user's profile and linked role profile."""
        data = request.data.copy()
        
        # 1. Athlete fields
        athlete_fields = [
            'date_of_birth', 'age', 'gender', 'city', 'state', 'preferred_language',
            'primary_sport', 'playing_role', 'secondary_role', 'club_name',
            'height', 'weight', 'batting_hand', 'bowling_style', 'preferred_position'
        ]
        
        extracted_athlete_data = {}
        for field in athlete_fields:
            if field in data:
                extracted_athlete_data[field] = data.pop(field)[0] if isinstance(data[field], list) else data.pop(field)

        # 2. Professional / Coach fields
        pro_fields = ['academy_name', 'address', 'session_price', 'bank_details']
        extracted_pro_data = {}
        for field in pro_fields:
            if field in data:
                extracted_pro_data[field] = data.pop(field)[0] if isinstance(data[field], list) else data.pop(field)

        serializer = UserProfileSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            
            # If athlete, update AthleteProfile
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

            # If coach, update ProfessionalProfile
            if user.role == 'PROFESSIONAL' and extracted_pro_data:
                profile, _ = ProfessionalProfile.objects.get_or_create(user=user)
                for key, val in extracted_pro_data.items():
                    if val is not None and val != '':
                        if key == 'session_price':
                            try:
                                val = float(val)
                            except (ValueError, TypeError):
                                val = profile.session_price
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
