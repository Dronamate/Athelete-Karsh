# accounts/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser
from .models import AthleteProfile, ProfessionalProfile


class CustomUserAdmin(UserAdmin):
    """
    Customizing the admin interface for our CustomUser model.
    We inherit from UserAdmin to keep Django's default password handling and UI.
    """
    model = CustomUser
    
    fieldsets = UserAdmin.fieldsets + (
        ('Role & Contact', {'fields': ('role', 'mobile_number')}),
    )
    
    list_display = ['username', 'email', 'mobile_number', 'first_name', 'last_name', 'role', 'is_staff']
    
    list_filter = ['role', 'is_staff', 'is_active']

admin.site.register(CustomUser, CustomUserAdmin)

@admin.register(AthleteProfile)
class AthleteProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'age', 'profession', 'pincode']
    search_fields = ['user__username', 'user__email', 'pincode', 'profession']

@admin.register(ProfessionalProfile)
class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'institution_club', 'training_mode', 'charges_per_session', 'is_certified', 'is_available']
    list_filter = ['is_certified', 'is_available', 'training_mode']
    search_fields = ['user__username', 'user__email', 'institution_club', 'pincode']