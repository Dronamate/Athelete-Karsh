# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Extends the default Django User model to include specific roles.
    We use AbstractUser to keep standard Django auth features (passwords, emails)
    while adding our custom 'role' field.
    """
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    
    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-'),
    ]
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, null=True, blank=True)
    
    # 1. Define the role choices as a class attribute for clean referencing
    class Role(models.TextChoices):
        ATHLETE = 'ATHLETE', 'Athlete'
        PROFESSIONAL = 'PROFESSIONAL', 'Professional'
        ADMIN = 'ADMIN', 'Platform Admin'

    # 2. Create the role field using the choices defined above. 
    # We set a default, but we will explicitly set this during registration/creation.
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ATHLETE,
        help_text="Designates the user's permissions and dashboard access."
    )

    def __str__(self):
        return f"{self.username} - {self.role}"


class AthleteProfile(models.Model):
    """
    Stores data specific to Athletes, specifically geared toward Cricket profiles (Batsman, Bowler, All-rounder).
    Linked One-to-One with the CustomUser model.
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='athlete_profile')
    
    # Personal & Cricket Profile Details
    date_of_birth = models.DateField(null=True, blank=True)
    age = models.PositiveIntegerField(null=True, blank=True, help_text="Age in years")
    gender = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    preferred_language = models.CharField(max_length=50, blank=True)
    
    # Cricket Roles & Attributes
    primary_sport = models.CharField(max_length=50, blank=True, default='Cricket')
    playing_role = models.CharField(max_length=50, blank=True, default='Batsman', help_text="Primary role (e.g. Batsman, Bowler, All-rounder, Wicket-keeper)")
    secondary_role = models.CharField(max_length=50, blank=True, default='Bowler', help_text="Secondary role (e.g. Bowler, Wicket-keeper, None)")
    club_name = models.CharField(max_length=150, blank=True, default='', help_text="Current club or academy name")
    height = models.CharField(max_length=30, blank=True, default='', help_text="Height e.g. 178 cm or 5'10\"")
    weight = models.CharField(max_length=30, blank=True, default='', help_text="Weight e.g. 72 kg")
    batting_hand = models.CharField(
        max_length=30, 
        blank=True, 
        default='Right-hand bat',
        choices=[('Right-hand bat', 'Right-hand bat'), ('Left-hand bat', 'Left-hand bat')]
    )
    bowling_style = models.CharField(max_length=60, blank=True, default='', help_text="e.g. Right-arm medium fast, Off-spin, Leg-break")
    preferred_position = models.CharField(
        max_length=60, 
        blank=True, 
        default='Top-Order Batsman',
        help_text="e.g. Opener, Top-Order (No. 3), Middle-Order (No. 4-5), Finisher"
    )
    
    # Timestamps for tracking when the profile was created/updated
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Athlete Profile: {self.user.username} ({self.playing_role})"


class ProfessionalProfile(models.Model):
    """
    Stores data specific to Coaches and Professionals.
    Linked One-to-One with the CustomUser model.
    """
    user = models.OneToOneField('CustomUser', on_delete=models.CASCADE, related_name='professional_profile')
    
    speciality = models.ForeignKey(
        'sports.Specialty', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="The verified taxonomy role (e.g., Batting Coach, Gym Trainer)"
    )
    
    is_certified = models.BooleanField(default=False, help_text="Checked by Admin upon verification")
    address = models.TextField(blank=True)
    academy_name = models.CharField(max_length=150, blank=True)
    session_price = models.DecimalField(
        max_digits=8, 
        decimal_places=2, 
        default=0.00, 
        help_text="Standard rate per session in INR"
    )
    
    bank_details = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        speciality_name = self.speciality.name if self.speciality else "Unassigned"
        return f"Pro Profile: {self.user.username} ({speciality_name})"
