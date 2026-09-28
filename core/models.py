import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.utils.crypto import get_random_string

class UserManager(BaseUserManager):
    """Custom manager where email is the unique identifier for auth."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        username = extra_fields.get('username')
        if not username:
            extra_fields['username'] = email.split('@')[0] + '_' + get_random_string(5)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'COLLEGE_ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class College(models.Model):
    name = models.CharField(max_length=255, unique=True)
    logo = models.ImageField(upload_to='colleges/logos/', null=True, blank=True)
    logo_url = models.URLField(max_length=500, blank=True, null=True, help_text="Fallback URL if logo image is not uploaded")
    description = models.TextField(help_text="Overview of the college/institution")
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

    @property
    def display_logo(self):
        if self.logo and hasattr(self.logo, 'url'):
            return self.logo.url
        if self.logo_url:
            return self.logo_url
        return 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80'

    @property
    def active_events_count(self):
        return self.events.filter(date__gte=timezone.localdate()).count()


class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('COLLEGE_ADMIN', 'College Admin'),
    )

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    college = models.ForeignKey(College, on_delete=models.SET_NULL, null=True, blank=True, related_name='members')
    college_name_other = models.CharField(max_length=255, blank=True, help_text="Custom college name if not listed in directory")
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='users/avatars/', null=True, blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    objects = UserManager()

    def save(self, *args, **kwargs):
        if not self.username or not self.username.strip():
            base = self.email.split('@')[0] if self.email else 'user'
            clean_base = "".join(c for c in base if c.isalnum() or c == '_') or 'user'
            candidate = f"{clean_base}_{get_random_string(6)}"
            while User.objects.filter(username=candidate).exclude(pk=self.pk).exists():
                candidate = f"{clean_base}_{get_random_string(8)}"
            self.username = candidate
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.email}) - {self.get_role_display()}"

    @property
    def is_student(self):
        return self.role == 'STUDENT'

    @property
    def is_college_admin(self):
        return self.role == 'COLLEGE_ADMIN' or self.is_superuser

    @property
    def college_display_name(self):
        if self.college:
            return self.college.name
        return self.college_name_other or "Not specified"

    @property
    def display_avatar(self):
        if self.avatar and hasattr(self.avatar, 'url'):
            return self.avatar.url
        if self.avatar_url:
            return self.avatar_url
        # Clean SVG-style initial avatar
        initial = (self.name or self.email or 'U')[0].upper()
        return f"https://ui-avatars.com/api/?name={initial}&background=6366f1&color=fff&size=128&bold=true"


class Event(models.Model):
    CATEGORY_CHOICES = (
        ('Technical', 'Technical'),
        ('Hackathon', 'Hackathon'),
        ('Symposium', 'Symposium'),
        ('Workshop', 'Workshop'),
        ('Cultural', 'Cultural'),
        ('Sports', 'Sports'),
        ('Gaming', 'Gaming'),
        ('Paper Presentation', 'Paper Presentation'),
        ('Career', 'Career'),
        ('Other', 'Other'),
    )

    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='events')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_events', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    poster = models.ImageField(upload_to='events/posters/', null=True, blank=True)
    poster_url = models.URLField(max_length=500, blank=True, null=True, help_text="Direct link / fallback poster image")
    date = models.DateField(db_index=True)
    start_time = models.TimeField()
    end_time = models.TimeField()
    venue = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    state = models.CharField(max_length=100, db_index=True)
    registration_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_participants = models.PositiveIntegerField(default=100)
    rules = models.TextField(blank=True, help_text="Event guidelines, eligibility, rules and prerequisites")
    registration_deadline = models.DateField(help_text="Last date to register")
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.title} - {self.college.name}"

    @property
    def is_free(self):
        return self.registration_fee == 0

    @property
    def display_fee(self):
        if self.is_free:
            return "Free"
        return f"₹{int(self.registration_fee) if self.registration_fee % 1 == 0 else self.registration_fee}"

    @property
    def display_poster(self):
        if self.poster and hasattr(self.poster, 'url'):
            return self.poster.url
        if self.poster_url:
            return self.poster_url
        # Category-based default banners
        category_defaults = {
            'Hackathon': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
            'Technical': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
            'Symposium': 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
            'Workshop': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
            'Cultural': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
            'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
            'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
            'Paper Presentation': 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
            'Career': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&auto=format&fit=crop&q=80',
        }
        return category_defaults.get(self.category, 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&auto=format&fit=crop&q=80')

    @property
    def registered_count(self):
        return self.registrations.filter(status='CONFIRMED').count()

    @property
    def spots_left(self):
        remaining = self.max_participants - self.registered_count
        return max(0, remaining)

    @property
    def is_full(self):
        return self.registered_count >= self.max_participants

    @property
    def is_past(self):
        return self.date < timezone.localdate()

    @property
    def is_registration_closed(self):
        return self.registration_deadline < timezone.localdate() or self.is_full or self.is_past

    @property
    def fill_percentage(self):
        if self.max_participants <= 0:
            return 0
        pct = (self.registered_count / self.max_participants) * 100
        return min(100, round(pct, 1))


class Registration(models.Model):
    STATUS_CHOICES = (
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
    )

    registration_id = models.CharField(max_length=32, unique=True, editable=False, db_index=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='CONFIRMED')
    notes = models.TextField(blank=True, help_text="Optional remarks or team details")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'event'], name='unique_student_event_registration')
        ]
        ordering = ['-registered_at']

    def __str__(self):
        return f"{self.registration_id} - {self.student.name} ({self.event.title})"

    def save(self, *args, **kwargs):
        if not self.registration_id:
            # Generate clean professional registration code, e.g., CC-2026-9A82D1
            year = timezone.now().year
            rand_code = uuid.uuid4().hex[:6].upper()
            self.registration_id = f"CC-{year}-{rand_code}"
        super().save(*args, **kwargs)


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=50, blank=True)
    department = models.CharField(max_length=150, blank=True)
    year_of_study = models.CharField(max_length=30, blank=True)
    skills = models.CharField(max_length=300, blank=True, help_text="Comma-separated skills (e.g. Python, AI, React)")
    bio = models.TextField(blank=True)
    github_url = models.URLField(max_length=300, blank=True)
    linkedin_url = models.URLField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.name} ({self.user.email})"


class EventCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    icon = models.CharField(max_length=60, default='bi-stars', help_text="Bootstrap icon class")
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "Event Categories"
        ordering = ['name']

    def __str__(self):
        return self.name


class SavedEvent(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_events')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='saved_by_users')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'event'], name='unique_user_saved_event')
        ]
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.email} saved {self.event.title}"


class Notification(models.Model):
    TYPE_CHOICES = (
        ('REGISTRATION', 'Registration Confirmed'),
        ('EVENT_UPDATE', 'Event Update'),
        ('REMINDER', 'Event Reminder'),
        ('SYSTEM', 'Platform System'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='SYSTEM')
    link = models.CharField(max_length=300, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.email}: {self.title}"
