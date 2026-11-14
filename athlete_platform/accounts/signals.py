# accounts/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, AthleteProfile, ProfessionalProfile


@receiver(post_save, sender=CustomUser)
def manage_user_profile(sender, instance, created, **kwargs):
    """
    Ensures a role-appropriate profile exists whenever a user is created or role-updated.
    """
    if instance.role == CustomUser.Role.ATHLETE:
        AthleteProfile.objects.get_or_create(user=instance)
    elif instance.role == CustomUser.Role.PROFESSIONAL:
        profile, _ = ProfessionalProfile.objects.get_or_create(user=instance)
        speciality_id = getattr(instance, '_speciality_id', None) or getattr(instance, '_specialty_id', None)
        if speciality_id and not profile.speciality_id:
            profile.speciality_id = speciality_id
            profile.save()
