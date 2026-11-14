# accounts/views.py
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

from .models import AthleteProfile, ProfessionalProfile
from .serializers import (
    AdminUserSerializer,
    AthleteRegisterSerializer,
    CoachDirectorySerializer,
    CoachRegisterSerializer,
    UnifiedLoginSerializer,
    UserProfileSerializer,
    UserSerializer,
)

User = get_user_model()


def build_auth_payload(user, request=None):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user, context={'request': request}).data,
    }


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')


class UnifiedLoginView(APIView):
    """Logs in using Email, Mobile Number, or Username + Password and issues JWT tokens."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UnifiedLoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(build_auth_payload(serializer.validated_data['user'], request), status=status.HTTP_200_OK)


class FirebaseAuthView(APIView):
    """
    Verifies Firebase ID token sent from the React frontend,
    authenticates or registers the athlete in Django, and issues JWT tokens.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({'error': 'id_token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from core.firebase import verify_firebase_token
            decoded = verify_firebase_token(id_token)
            email = decoded.get('email')
            uid = decoded.get('uid')
            name = decoded.get('name', '')
            phone_number = decoded.get('phone_number')

            if not email:
                email = f"{uid}@drona-mate-auth.firebase"

            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exclude(email=email).exists():
                username = f"{base_username}_{counter}"
                counter += 1

            first_name = name.split()[0] if name else ''
            last_name = ' '.join(name.split()[1:]) if name and len(name.split()) > 1 else ''

            user = None
            if phone_number:
                user = User.objects.filter(mobile_number=phone_number).first()
            if not user and email:
                user = User.objects.filter(email=email).first()

            if not user:
                user = User.objects.create(
                    email=email,
                    username=username,
                    first_name=first_name,
                    last_name=last_name,
                    mobile_number=phone_number,
                    role='ATHLETE',
                )
            else:
                if phone_number and not user.mobile_number:
                    user.mobile_number = phone_number
                    user.save(update_fields=['mobile_number'])

            if not hasattr(user, 'athlete_profile'):
                AthleteProfile.objects.create(user=user)

            return Response(build_auth_payload(user, request), status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Firebase token verification failed: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)


class AthleteRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = AthleteRegisterSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(build_auth_payload(user, request), status=status.HTTP_201_CREATED)


class CoachRegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        serializer = CoachRegisterSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(build_auth_payload(user, request), status=status.HTTP_201_CREATED)


class CoachAvailabilityView(APIView):
    """
    Secured PUT/PATCH endpoint (/api/coach/availability) allowing either
    the Coach (for themselves) or an Admin (for any coach_id) to toggle is_available.
    """
    permission_classes = [permissions.IsAuthenticated]

    def _update_availability(self, request):
        user = request.user
        requested_coach_id = request.data.get('coach_id') or request.query_params.get('coach_id')

        if user.role == 'ADMIN':
            target_id = requested_coach_id or user.id
            target_user = User.objects.filter(id=target_id, role='PROFESSIONAL').first()
            if not target_user:
                return Response({'error': 'Target coach not found.'}, status=status.HTTP_404_NOT_FOUND)
        elif user.role == 'PROFESSIONAL':
            if requested_coach_id and str(requested_coach_id) != str(user.id):
                return Response(
                    {'error': 'Coaches can only update their own availability.'},
                    status=status.HTTP_403_FORBIDDEN,
                )
            target_user = user
        else:
            return Response(
                {'error': 'Only Coaches or Admins can update coach availability.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        profile, _ = ProfessionalProfile.objects.get_or_create(user=target_user)
        if 'is_available' in request.data:
            raw_val = request.data.get('is_available')
            if isinstance(raw_val, str):
                profile.is_available = raw_val.lower() in ('true', '1', 'yes')
            else:
                profile.is_available = bool(raw_val)
        else:
            profile.is_available = not profile.is_available

        profile.save(update_fields=['is_available', 'updated_at'])
        return Response({
            'coach_id': target_user.id,
            'username': target_user.username,
            'is_available': profile.is_available,
            'message': f"Coach availability set to {'Available' if profile.is_available else 'Unavailable'}.",
        }, status=status.HTTP_200_OK)

    def put(self, request):
        return self._update_availability(request)

    def patch(self, request):
        return self._update_availability(request)


class CoachDirectoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public Coach Search Feed (/api/coaches/) supporting category, training_mode,
    pincode, and keyword search filters.
    """
    serializer_class = CoachDirectorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = (
            ProfessionalProfile.objects
            .select_related('user', 'speciality')
            .prefetch_related('expertise')
            .filter(user__role='PROFESSIONAL', user__is_active=True)
            .order_by('-is_available', '-is_certified', 'user__first_name')
        )

        category = self.request.query_params.get('category', '').strip()
        training_mode = self.request.query_params.get('training_mode', '').strip()
        pincode = self.request.query_params.get('pincode', '').strip()
        search = self.request.query_params.get('search', '').strip()
        available_only = self.request.query_params.get('available_only', '').strip().lower()

        if category and category.upper() != 'ALL':
            qs = qs.filter(
                Q(expertise__name__iexact=category) | Q(speciality__name__iexact=category)
            ).distinct()

        if training_mode and training_mode.upper() != 'ALL':
            mode_norm = training_mode.capitalize()
            if mode_norm in ('Online', 'Offline'):
                qs = qs.filter(training_mode__in=[mode_norm, 'Both'])
            elif mode_norm == 'Both':
                qs = qs.filter(training_mode='Both')

        if pincode:
            qs = qs.filter(pincode__icontains=pincode)

        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__username__icontains=search)
                | Q(institution_club__icontains=search)
                | Q(academy_name__icontains=search)
                | Q(pincode__icontains=search)
                | Q(expertise__name__icontains=search)
            ).distinct()

        if available_only == 'true':
            qs = qs.filter(is_available=True)

        return qs


class AdminUserViewSet(viewsets.ModelViewSet):
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
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
                | Q(mobile_number__icontains=search)
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
        return Response({'message': f"Password for {user.username} was successfully reset."})

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            return Response({'error': 'You cannot ban or deactivate your own admin account.'}, status=status.HTTP_400_BAD_REQUEST)
        user.is_active = not user.is_active
        user.save()
        status_label = "Active" if user.is_active else "Suspended / Banned"
        return Response({'message': f"Account {user.username} is now {status_label}.", 'is_active': user.is_active})

    @action(detail=True, methods=['post'])
    def impersonate(self, request, pk=None):
        user = self.get_object()
        refresh = RefreshToken.for_user(user)
        user_serializer = UserProfileSerializer(user, context={'request': request})
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': user_serializer.data,
            'message': f"Impersonating {user.username} ({user.role})",
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        return Response({
            'total_users': User.objects.count(),
            'total_athletes': User.objects.filter(role='ATHLETE').count(),
            'total_professionals': User.objects.filter(role='PROFESSIONAL').count(),
            'total_admins': User.objects.filter(role='ADMIN').count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'suspended_users': User.objects.filter(is_active=False).count(),
        })


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        return Response(UserProfileSerializer(request.user, context={'request': request}).data)

    def patch(self, request):
        data = request.data.copy()

        athlete_fields = [
            'age', 'profession', 'address', 'pincode', 'additional_details',
            'date_of_birth', 'gender', 'city', 'state', 'preferred_language',
            'primary_sport', 'playing_role', 'secondary_role', 'club_name',
            'height', 'weight', 'batting_hand', 'bowling_style', 'preferred_position',
        ]
        extracted_athlete_data = {
            f: (data.pop(f)[0] if isinstance(data[f], list) else data.pop(f))
            for f in athlete_fields if f in data
        }

        pro_fields = [
            'institution_club', 'academy_name', 'address', 'pincode', 'training_mode',
            'charges_per_session', 'session_price', 'is_certified', 'is_available',
            'additional_details', 'bank_details', 'profile_photo',
        ]
        extracted_pro_data = {
            f: (data.pop(f)[0] if isinstance(data[f], list) else data.pop(f))
            for f in pro_fields if f in data
        }

        serializer = UserProfileSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            user = serializer.save()

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

            if user.role == 'PROFESSIONAL' and extracted_pro_data:
                profile, _ = ProfessionalProfile.objects.get_or_create(user=user)
                for key, val in extracted_pro_data.items():
                    if val is not None and val != '':
                        if key in ('session_price', 'charges_per_session'):
                            try:
                                val = float(val)
                            except (ValueError, TypeError):
                                continue
                        elif key in ('is_certified', 'is_available') and isinstance(val, str):
                            val = val.lower() in ('true', '1', 'yes')
                        setattr(profile, key, val)
                profile.save()

            return Response(UserProfileSerializer(request.user, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    callback_url = 'postmessage'
    client_class = OAuth2Client
