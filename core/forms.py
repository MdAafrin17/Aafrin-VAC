from django import forms
from django.contrib.auth import authenticate
from .models import User, College, Event

class StudentRegistrationForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Create secure password (min 6 chars)'}),
        min_length=6
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm password'}),
        min_length=6
    )

    class Meta:
        model = User
        fields = ['name', 'email', 'college', 'college_name_other', 'phone', 'password']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Full Name'}),
            'email': forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'name@example.com'}),
            'college': forms.Select(attrs={'class': 'form-select'}),
            'college_name_other': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Or enter your college name if not listed above'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+91 9876543210'}),
        }

    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('password')
        p2 = cleaned_data.get('confirm_password')
        if p1 and p2 and p1 != p2:
            self.add_error('confirm_password', "Passwords do not match.")
        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = 'STUDENT'
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


class CollegeAdminRegistrationForm(forms.Form):
    name = forms.CharField(
        max_length=255,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Coordinator / Representative Name'})
    )
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'admin@college.edu or name@example.com'})
    )
    phone = forms.CharField(
        max_length=20,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+91 9876543210'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Password (min 6 chars)'}),
        min_length=6
    )
    confirm_password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm password'}),
        min_length=6
    )

    # College details
    existing_college = forms.ModelChoiceField(
        queryset=College.objects.all(),
        required=False,
        empty_label="-- Select Existing College or Register New Below --",
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    college_name = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Official College / University Name'})
    )
    address = forms.CharField(
        max_length=255,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Campus Address / Landmark'})
    )
    city = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'City (e.g., Chennai, Bengaluru)'})
    )
    state = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'State (e.g., Tamil Nadu)'})
    )
    website = forms.URLField(
        required=False,
        widget=forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://www.college.edu'})
    )
    description = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Brief description of the college/institution'})
    )

    def clean_email(self):
        email = self.cleaned_data.get('email').lower()
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError("An account with this email already exists.")
        return email

    def clean(self):
        cleaned_data = super().clean()
        p1 = cleaned_data.get('password')
        p2 = cleaned_data.get('confirm_password')
        if p1 and p2 and p1 != p2:
            self.add_error('confirm_password', "Passwords do not match.")

        existing = cleaned_data.get('existing_college')
        new_name = cleaned_data.get('college_name')
        if not existing and not new_name:
            self.add_error('college_name', "Please select an existing college or provide a new college name.")
        return cleaned_data

    def save(self):
        cleaned_data = self.cleaned_data
        existing_col = cleaned_data.get('existing_college')

        if existing_col:
            college = existing_col
        else:
            college = College.objects.create(
                name=cleaned_data.get('college_name'),
                address=cleaned_data.get('address') or 'Campus Address',
                city=cleaned_data.get('city') or 'City',
                state=cleaned_data.get('state') or 'State',
                website=cleaned_data.get('website') or '',
                description=cleaned_data.get('description') or f"Welcome to {cleaned_data.get('college_name')}."
            )

        user = User.objects.create_user(
            email=cleaned_data.get('email'),
            password=cleaned_data.get('password'),
            name=cleaned_data.get('name'),
            role='COLLEGE_ADMIN',
            college=college,
            phone=cleaned_data.get('phone', '')
        )
        return user


class LoginForm(forms.Form):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={'class': 'form-control', 'placeholder': 'name@example.com', 'autocomplete': 'username'})
    )
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Enter your password', 'autocomplete': 'current-password'})
    )

    def clean(self):
        cleaned_data = super().clean()
        email = cleaned_data.get('email')
        password = cleaned_data.get('password')

        if email and password:
            user = authenticate(email=email.lower(), password=password)
            if not user:
                # Also try matching username
                try:
                    u_match = User.objects.get(email__iexact=email)
                    user = authenticate(username=u_match.username, password=password)
                except User.DoesNotExist:
                    pass

            if not user:
                raise forms.ValidationError("Invalid email or password. Please check your credentials.")
            if not user.is_active:
                raise forms.ValidationError("This account has been deactivated.")
            cleaned_data['user'] = user
        return cleaned_data


class EventForm(forms.ModelForm):
    class Meta:
        model = Event
        fields = [
            'title', 'category', 'description', 'poster', 'poster_url',
            'date', 'start_time', 'end_time', 'venue', 'city', 'state',
            'registration_fee', 'max_participants', 'rules', 'registration_deadline'
        ]
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. InnovateX 2026: National Hackathon'}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Detailed overview, objectives, highlights, and perks...'}),
            'poster': forms.ClearableFileInput(attrs={'class': 'form-control'}),
            'poster_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'https://example.com/poster.jpg (optional poster URL)'}),
            'date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'venue': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Auditorium / Seminar Hall / Ground'}),
            'city': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Chennai'}),
            'state': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g. Tamil Nadu'}),
            'registration_fee': forms.NumberInput(attrs={'class': 'form-control', 'min': '0', 'step': '1'}),
            'max_participants': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'}),
            'rules': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Eligibility, team sizes, guidelines, what to bring...'}),
            'registration_deadline': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        }
