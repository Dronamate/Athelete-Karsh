# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """
    Core user model supporting Email or Mobile Number authentication and role-based access.
    """
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    mobile_number = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
        help_text="Normalized mobile number used for unified login."
    )
    dob = models.DateField(null=True, blank=True)

    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'),
        ('O+', 'O+'), ('O-', 'O-'), ('AB+', 'AB+'), ('AB-', 'AB-'),
    ]
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, null=True, blank=True)

    class Role(models.TextChoices):
        ATHLETE = 'ATHLETE', 'Athlete'
        PROFESSIONAL = 'PROFESSIONAL', 'Coach / Trainer'
        ADMIN = 'ADMIN', 'Platform Admin'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.ATHLETE,
        help_text="Designates the user's permissions and dashboard access."
    )

    def __str__(self):
        return f"{self.get_full_name() or self.username} - {self.role}"


class AthleteProfile(models.Model):
    """
    Stores booking & onboarding details for Athletes.
    Legacy sports/physical fields remain nullable/blank for backward compatibility.
    """
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='athlete_profile')

    # Core Onboarding Fields (Tasks 2 & 3)
    age = models.PositiveIntegerField(null=True, blank=True, help_text="Age in years")
    profession = models.CharField(max_length=120, blank=True, default='')
    address = models.TextField(blank=True, default='')
    pincode = models.CharField(max_length=10, blank=True, default='')
    additional_details = models.TextField(blank=True, default='')

    # Legacy fields kept intact for soft-decoupling / non-destructive migrations
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    preferred_language = models.CharField(max_length=50, blank=True)
    primary_sport = models.CharField(max_length=50, blank=True, default='Cricket')
    playing_role = models.CharField(max_length=50, blank=True, default='Batsman')
    secondary_role = models.CharField(max_length=50, blank=True, default='Bowler')
    club_name = models.CharField(max_length=150, blank=True, default='')
    height = models.CharField(max_length=30, blank=True, default='')
    weight = models.CharField(max_length=30, blank=True, default='')
    batting_hand = models.CharField(
        max_length=30,
        blank=True,
        default='Right-hand bat',
        choices=[('Right-hand bat', 'Right-hand bat'), ('Left-hand bat', 'Left-hand bat')]
    )
    bowling_style = models.CharField(max_length=60, blank=True, default='')
    preferred_position = models.CharField(max_length=60, blank=True, default='Top-Order Batsman')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Athlete Profile: {self.user.get_full_name() or self.user.username}"


class ProfessionalProfile(models.Model):
    """
    Stores Coach/Trainer booking profile, expertise tags, pricing, and live availability.
    """
    class TrainingMode(models.TextChoices):
        ONLINE = 'Online', 'Online'
        OFFLINE = 'Offline', 'Offline'
        BOTH = 'Both', 'Both'

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='professional_profile')

    # Taxonomy & Expertise (Relational tags via sports.Specialty)
    speciality = models.ForeignKey(
        'sports.Specialty',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Primary legacy specialty reference."
    )
    expertise = models.ManyToManyField(
        'sports.Specialty',
        blank=True,
        related_name='coaches',
        help_text="Coach expertise categories."
    )

    # Coach Profile & Booking Fields (Tasks 2 & 3)
    institution_club = models.CharField(max_length=150, null=True, blank=True)
    profile_photo = models.ImageField(upload_to='coach_photos/', null=True, blank=True)
    profile_photo_url = models.URLField(max_length=500, blank=True, default='')
    is_certified = models.BooleanField(default=False, help_text="Certification status")
    charges_per_session = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text="Charges per session in INR"
    )
    address = models.TextField(blank=True, default='')
    pincode = models.CharField(max_length=10, blank=True, default='')
    training_mode = models.CharField(
        max_length=10,
        choices=TrainingMode.choices,
        default=TrainingMode.BOTH
    )
    is_available = models.BooleanField(default=True, help_text="Live booking availability toggle")
    additional_details = models.TextField(blank=True, default='')

    # Legacy fields kept in sync for backward compatibility
    academy_name = models.CharField(max_length=150, blank=True)
    session_price = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    bank_details = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.charges_per_session and not self.session_price:
            self.session_price = self.charges_per_session
        elif self.session_price and not self.charges_per_session:
            self.charges_per_session = self.session_price
        if self.institution_club and not self.academy_name:
            self.academy_name = self.institution_club
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Coach Profile: {self.user.get_full_name() or self.user.username} ({self.training_mode})"
