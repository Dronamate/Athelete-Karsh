# core/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from sports.views import SportViewSet, SpecialtyViewSet
from bookings.views import AvailabilitySlotViewSet, BookingViewSet, NotificationViewSet, ReviewViewSet
from accounts.views import (
    AdminUserViewSet,
    AthleteRegisterView,
    CoachAvailabilityView,
    CoachDirectoryViewSet,
    CoachRegisterView,
    FirebaseAuthView,
    GoogleLogin,
    UnifiedLoginView,
    UserProfileView,
)
from learning.views import ModuleViewSet
from chat.views import ConversationViewSet, MessageViewSet
from performance.views import DailyLogViewSet, CricketPerformanceViewSet

router = DefaultRouter()

router.register(r'sports', SportViewSet, basename='sport')
router.register(r'specialties', SpecialtyViewSet, basename='specialty')
router.register(r'coaches', CoachDirectoryViewSet, basename='coach')
router.register(r'slots', AvailabilitySlotViewSet, basename='slot')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'learning', ModuleViewSet, basename='learning-module')
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'performance', DailyLogViewSet, basename='performance')
router.register(r'cricket-stats', CricketPerformanceViewSet, basename='cricket-stats')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('admin/', admin.site.urls),

    # Unified Email/Mobile Login & Role-Specific Onboarding
    path('api/auth/login/', UnifiedLoginView.as_view(), name='unified-login'),
    path('api/auth/register/athlete/', AthleteRegisterView.as_view(), name='athlete-register'),
    path('api/auth/register/coach/', CoachRegisterView.as_view(), name='coach-register'),

    # Standard Auth Endpoints
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('api/auth/firebase/', FirebaseAuthView.as_view(), name='firebase_login'),

    # Coach Availability Toggle & Profile
    path('api/coach/availability', CoachAvailabilityView.as_view(), name='coach-availability'),
    path('api/profile/', UserProfileView.as_view(), name='user-profile'),

    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
