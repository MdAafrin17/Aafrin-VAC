import csv
from datetime import timedelta
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.db.models import Q, Count
from django.utils import timezone
from django.core.paginator import Paginator

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import User, College, Event, Registration
from .forms import StudentRegistrationForm, CollegeAdminRegistrationForm, LoginForm, EventForm
from .serializers import CollegeSerializer, EventSerializer, RegistrationSerializer, UserSerializer
from .permissions import IsCollegeAdminOrReadOnly, IsStudentUser


# ==============================================================================
# 1. TEMPLATE / FRONTEND VIEWS
# ==============================================================================

def home_view(request):
    """1. Landing / Home Page"""
    today = timezone.localdate()
    upcoming_events = Event.objects.filter(is_published=True, date__gte=today).select_related('college')[:6]
    
    # Events near you (filter by user's college city if logged in, else default popular city Chennai or first available)
    user_city = "Chennai"
    if request.user.is_authenticated and request.user.college and request.user.college.city:
        user_city = request.user.college.city
    
    events_near = Event.objects.filter(is_published=True, city__iexact=user_city, date__gte=today).select_related('college')[:4]
    if not events_near.exists():
        events_near = Event.objects.filter(is_published=True, date__gte=today).select_related('college')[:4]

    featured_colleges = College.objects.annotate(num_events=Count('events')).order_by('-num_events')[:6]
    cities = Event.objects.values_list('city', flat=True).distinct()
    categories = [cat[0] for cat in Event.CATEGORY_CHOICES]

    total_events = Event.objects.filter(is_published=True).count()
    total_colleges = College.objects.count()
    total_registrations = Registration.objects.filter(status='CONFIRMED').count()

    context = {
        'upcoming_events': upcoming_events,
        'events_near': events_near,
        'featured_colleges': featured_colleges,
        'cities': sorted(list(set(cities))),
        'categories': categories,
        'user_city': user_city,
        'total_events': total_events,
        'total_colleges': total_colleges,
        'total_registrations': total_registrations,
    }
    return render(request, 'home.html', context)


def events_discovery_view(request):
    """2. Event Discovery Page with Multi-filters & Keyword Search"""
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category', '').strip()
    city = request.GET.get('city', '').strip()
    state = request.GET.get('state', '').strip()
    date_filter = request.GET.get('date', '').strip()  # today, week, month, past, all
    fee_type = request.GET.get('fee', '').strip()      # free, paid, all
    sort_by = request.GET.get('sort', 'date_asc')

    events = Event.objects.filter(is_published=True).select_related('college')
    today = timezone.localdate()

    if query:
        # Support combined searches like "hackathon", "symposium Chennai", "workshop"
        words = query.split()
        q_obj = Q()
        for w in words:
            q_obj |= (
                Q(title__icontains=w) |
                Q(description__icontains=w) |
                Q(category__icontains=w) |
                Q(city__icontains=w) |
                Q(college__name__icontains=w) |
                Q(state__icontains=w)
            )
        events = events.filter(q_obj)

    if category and category != 'All':
        events = events.filter(category__iexact=category)

    if city and city != 'All':
        events = events.filter(city__iexact=city)

    if state and state != 'All':
        events = events.filter(state__iexact=state)

    if date_filter == 'today':
        events = events.filter(date=today)
    elif date_filter == 'week':
        events = events.filter(date__gte=today, date__lte=today + timedelta(days=7))
    elif date_filter == 'month':
        events = events.filter(date__gte=today, date__lte=today + timedelta(days=30))
    elif date_filter == 'past':
        events = events.filter(date__lt=today)
    else: # Default upcoming
        if date_filter != 'all':
            events = events.filter(date__gte=today)

    if fee_type == 'free':
        events = events.filter(registration_fee=0)
    elif fee_type == 'paid':
        events = events.filter(registration_fee__gt=0)

    if sort_by == 'date_desc':
        events = events.order_by('-date', '-start_time')
    elif sort_by == 'fee_asc':
        events = events.order_by('registration_fee', 'date')
    elif sort_by == 'fee_desc':
        events = events.order_by('-registration_fee', 'date')
    else:
        events = events.order_by('date', 'start_time')

    all_cities = sorted(list(set(Event.objects.values_list('city', flat=True).distinct())))
    all_states = sorted(list(set(Event.objects.values_list('state', flat=True).distinct())))
    categories = [cat[0] for cat in Event.CATEGORY_CHOICES]

    paginator = Paginator(events, 9)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)

    context = {
        'events': page_obj,
        'query': query,
        'selected_category': category,
        'selected_city': city,
        'selected_state': state,
        'selected_date': date_filter,
        'selected_fee': fee_type,
        'selected_sort': sort_by,
        'categories': categories,
        'cities': all_cities,
        'states': all_states,
        'total_count': events.count(),
    }
    return render(request, 'events/discovery.html', context)


def event_detail_view(request, pk):
    """3. Event Details Page"""
    event = get_object_or_404(Event.objects.select_related('college', 'created_by'), pk=pk)
    
    # Check if student is already registered
    is_registered = False
    student_registration = None
    if request.user.is_authenticated and request.user.is_student:
        student_registration = Registration.objects.filter(
            student=request.user, event=event, status='CONFIRMED'
        ).first()
        is_registered = student_registration is not None

    # Related events from same category or same college
    related_events = Event.objects.filter(
        Q(category=event.category) | Q(college=event.college),
        is_published=True,
        date__gte=timezone.localdate()
    ).exclude(pk=event.pk).distinct()[:3]

    can_edit = False
    if request.user.is_authenticated:
        if request.user.is_superuser:
            can_edit = True
        elif request.user.is_college_admin and (event.created_by == request.user or (request.user.college and event.college == request.user.college)):
            can_edit = True

    context = {
        'event': event,
        'is_registered': is_registered,
        'registration': student_registration,
        'related_events': related_events,
        'can_edit': can_edit,
    }
    return render(request, 'events/detail.html', context)


def college_detail_view(request, pk):
    """4. College Details Page"""
    college = get_object_or_404(College, pk=pk)
    today = timezone.localdate()
    upcoming_events = college.events.filter(is_published=True, date__gte=today).order_by('date')
    past_events = college.events.filter(is_published=True, date__lt=today).order_by('-date')
    
    total_registrations = Registration.objects.filter(
        event__college=college, status='CONFIRMED'
    ).count()

    categories_hosted = list(college.events.values_list('category', flat=True).distinct())

    can_manage = False
    if request.user.is_authenticated:
        if request.user.is_superuser or (request.user.is_college_admin and request.user.college == college):
            can_manage = True

    context = {
        'college': college,
        'upcoming_events': upcoming_events,
        'past_events': past_events,
        'total_events': college.events.count(),
        'total_registrations': total_registrations,
        'categories_hosted': categories_hosted,
        'can_manage': can_manage,
    }
    return render(request, 'colleges/detail.html', context)



def login_view(request):
    """5 & 7. Student and College Admin Login with quick demo switch"""
    role_hint = request.GET.get('role', 'student').lower()
    if request.user.is_authenticated:
        if request.user.is_college_admin:
            return redirect('college_dashboard')
        return redirect('student_dashboard')

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            user = form.cleaned_data['user']
            login(request, user)
            messages.success(request, f"Welcome back, {user.name}!")
            next_url = request.GET.get('next')
            if next_url:
                return redirect(next_url)
            if user.is_college_admin:
                return redirect('college_dashboard')
            return redirect('student_dashboard')
    else:
        form = LoginForm()

    return render(request, 'auth/login.html', {'form': form, 'role_hint': role_hint})


def student_register_view(request):
    """6. Student Registration"""
    if request.user.is_authenticated:
        return redirect('student_dashboard')

    if request.method == 'POST':
        form = StudentRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to CampusConnect, {user.name}! Your student profile has been created.")
            return redirect('student_dashboard')
    else:
        form = StudentRegistrationForm()

    return render(request, 'auth/student_register.html', {'form': form})


def college_admin_register_view(request):
    """College Admin Registration"""
    if request.user.is_authenticated:
        return redirect('college_dashboard')

    if request.method == 'POST':
        form = CollegeAdminRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Welcome to CampusConnect! College account for {user.college_display_name} created.")
            return redirect('college_dashboard')
    else:
        form = CollegeAdminRegistrationForm()

    return render(request, 'auth/college_register.html', {'form': form})


def logout_view(request):
    logout(request)
    messages.info(request, "You have been logged out.")
    return redirect('home')


@login_required
def student_dashboard_view(request):
    """9. Student Dashboard"""
    if not request.user.is_student:
        return redirect('college_dashboard')

    today = timezone.localdate()
    registrations = Registration.objects.filter(student=request.user).select_related('event', 'event__college').order_by('-registered_at')
    
    upcoming_regs = registrations.filter(status='CONFIRMED', event__date__gte=today)
    past_regs = registrations.filter(event__date__lt=today)
    
    recommended_events = Event.objects.filter(
        is_published=True, date__gte=today
    ).exclude(registrations__student=request.user).order_by('?')[:4]

    context = {
        'registrations': registrations,
        'upcoming_regs': upcoming_regs,
        'past_regs': past_regs,
        'total_registrations': registrations.filter(status='CONFIRMED').count(),
        'recommended_events': recommended_events,
    }
    return render(request, 'dashboard/student.html', context)


@login_required
def college_dashboard_view(request):
    """8. College Admin Dashboard"""
    if not request.user.is_college_admin:
        messages.error(request, "Access denied. College administrator privileges required.")
        return redirect('student_dashboard')

    college = request.user.college
    if not college:
        # Superuser or admin without college yet
        events = Event.objects.all().select_related('college').order_by('-date')
    else:
        events = Event.objects.filter(college=college).order_by('-date')

    today = timezone.localdate()
    upcoming_events = events.filter(date__gte=today)
    
    # Aggregate metrics
    total_events = events.count()
    total_registrations = Registration.objects.filter(event__in=events, status='CONFIRMED').count()
    
    # Recent registrations
    recent_registrations = Registration.objects.filter(
        event__in=events
    ).select_related('student', 'event').order_by('-registered_at')[:10]

    context = {
        'college': college,
        'events': events,
        'upcoming_events': upcoming_events,
        'total_events': total_events,
        'total_registrations': total_registrations,
        'recent_registrations': recent_registrations,
    }
    return render(request, 'dashboard/college.html', context)


@login_required
def event_create_view(request):
    """10. Create Event (College Admin Only)"""
    if not request.user.is_college_admin:
        messages.error(request, "Only college admins can publish events.")
        return redirect('events_discovery')

    if not request.user.college and not request.user.is_superuser:
        messages.error(request, "Please set up your college profile first.")
        return redirect('college_dashboard')

    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES)
        if form.is_valid():
            event = form.save(commit=False)
            event.college = request.user.college or College.objects.first()
            event.created_by = request.user
            event.save()
            messages.success(request, f"Event '{event.title}' successfully published!")
            return redirect('event_detail', pk=event.pk)
    else:
        # Pre-fill city and state from college if available
        initial = {}
        if request.user.college:
            initial['city'] = request.user.college.city
            initial['state'] = request.user.college.state
        form = EventForm(initial=initial)

    return render(request, 'events/create.html', {'form': form, 'is_edit': False})


@login_required
def event_edit_view(request, pk):
    """11. Edit Event (Only the creator or college admin)"""
    event = get_object_or_404(Event, pk=pk)

    # Permission check
    can_edit = request.user.is_superuser or (
        request.user.is_college_admin and (
            event.created_by == request.user or (request.user.college and event.college == request.user.college)
        )
    )
    if not can_edit:
        messages.error(request, "You do not have permission to edit this event.")
        return redirect('event_detail', pk=event.pk)

    if request.method == 'POST':
        form = EventForm(request.POST, request.FILES, instance=event)
        if form.is_valid():
            form.save()
            messages.success(request, f"Event '{event.title}' updated successfully.")
            return redirect('event_detail', pk=event.pk)
    else:
        form = EventForm(instance=event)

    return render(request, 'events/create.html', {'form': form, 'is_edit': True, 'event': event})


@login_required
def event_delete_view(request, pk):
    """Delete Event (Only the creator or college admin)"""
    event = get_object_or_404(Event, pk=pk)

    can_delete = request.user.is_superuser or (
        request.user.is_college_admin and (
            event.created_by == request.user or (request.user.college and event.college == request.user.college)
        )
    )
    if not can_delete:
        messages.error(request, "You do not have permission to delete this event.")
        return redirect('event_detail', pk=event.pk)

    if request.method == 'POST':
        title = event.title
        event.delete()
        messages.success(request, f"Event '{title}' has been deleted.")
        return redirect('college_dashboard')

    return render(request, 'events/confirm_delete.html', {'event': event})


@login_required
def my_registrations_view(request):
    """12. My Registrations (Student feature)"""
    if not request.user.is_student:
        return redirect('college_dashboard')

    registrations = Registration.objects.filter(
        student=request.user
    ).select_related('event', 'event__college').order_by('-registered_at')

    context = {
        'registrations': registrations,
        'confirmed_count': registrations.filter(status='CONFIRMED').count(),
    }
    return render(request, 'dashboard/my_registrations.html', context)


@login_required
def cancel_registration_view(request, pk):
    """Cancel Registration action"""
    registration = get_object_or_404(Registration, pk=pk, student=request.user)
    if request.method == 'POST':
        registration.status = 'CANCELLED'
        registration.save()
        messages.info(request, f"Your registration for '{registration.event.title}' has been cancelled.")
        return redirect('my_registrations')
    return redirect('my_registrations')


@login_required
def export_event_participants_csv(request, pk):
    """College Admin can export attendee list to CSV"""
    event = get_object_or_404(Event, pk=pk)
    can_access = request.user.is_superuser or (
        request.user.is_college_admin and (
            event.created_by == request.user or (request.user.college and event.college == request.user.college)
        )
    )
    if not can_access:
        return HttpResponse("Unauthorized", status=403)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="{event.title}_attendees.csv"'

    writer = csv.writer(response)
    writer.writerow(['Registration ID', 'Student Name', 'Email', 'College', 'Phone', 'Registered At', 'Status', 'Notes'])

    registrations = event.registrations.select_related('student').all()
    for reg in registrations:
        writer.writerow([
            reg.registration_id,
            reg.student.name,
            reg.student.email,
            reg.student.college_display_name,
            reg.student.phone,
            reg.registered_at.strftime('%Y-%m-%d %H:%M:%S'),
            reg.get_status_display(),
            reg.notes
        ])

    return response


def about_view(request):
    """13. About CampusConnect"""
    return render(request, 'about.html')


def contact_view(request):
    """14. Contact Page"""
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')
        # In a real app we can send email or store contact query
        messages.success(request, f"Thank you, {name}! Your message has been received. Our team will contact you at {email} within 24 hours.")
        return redirect('contact')
    return render(request, 'contact.html')


# ==============================================================================
# 2. REST API VIEWS
# ==============================================================================

class EventViewSet(viewsets.ModelViewSet):
    """
    API endpoint for Events:
    GET /api/events/
    GET /api/events/<id>/
    POST /api/events/ (College Admin only)
    PUT /api/events/<id>/ (Owner College Admin only)
    DELETE /api/events/<id>/ (Owner College Admin only)
    """
    queryset = Event.objects.filter(is_published=True).select_related('college', 'created_by')
    serializer_class = EventSerializer
    permission_classes = [IsCollegeAdminOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        q = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        city = self.request.query_params.get('city')
        state = self.request.query_params.get('state')
        fee_type = self.request.query_params.get('fee')
        date_filter = self.request.query_params.get('date_filter')
        today = timezone.localdate()

        if q:
            words = q.split()
            q_obj = Q()
            for w in words:
                q_obj |= (
                    Q(title__icontains=w) |
                    Q(description__icontains=w) |
                    Q(category__icontains=w) |
                    Q(city__icontains=w) |
                    Q(college__name__icontains=w)
                )
            qs = qs.filter(q_obj)

        if category and category != 'All':
            qs = qs.filter(category__iexact=category)
        if city and city != 'All':
            qs = qs.filter(city__iexact=city)
        if state and state != 'All':
            qs = qs.filter(state__iexact=state)
        if fee_type == 'free':
            qs = qs.filter(registration_fee=0)
        elif fee_type == 'paid':
            qs = qs.filter(registration_fee__gt=0)

        if date_filter == 'today':
            qs = qs.filter(date=today)
        elif date_filter == 'week':
            qs = qs.filter(date__gte=today, date__lte=today + timedelta(days=7))
        elif date_filter == 'month':
            qs = qs.filter(date__gte=today, date__lte=today + timedelta(days=30))
        elif date_filter != 'all':
            qs = qs.filter(date__gte=today)

        return qs.order_by('date', 'start_time')


class CollegeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for Colleges:
    GET /api/colleges/
    GET /api/colleges/<id>/
    """
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['POST'])
def register_event_api(request):
    """
    POST /api/register-event/
    Registers the logged-in student for an event.
    Validates duplicate registration, capacity, and deadlines.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required. Please login as a student.'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if not request.user.is_student:
        return Response({'error': 'Only students can register for events.'}, status=status.HTTP_403_FORBIDDEN)

    event_id = request.data.get('event_id') or request.data.get('event')
    notes = request.data.get('notes', '')

    if not event_id:
        return Response({'error': 'Event ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        event = Event.objects.get(pk=event_id, is_published=True)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Check deadline
    if event.is_registration_closed:
        return Response({'error': 'Registration for this event is closed or event is full.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check duplicate
    existing = Registration.objects.filter(student=request.user, event=event).first()
    if existing:
        if existing.status == 'CONFIRMED':
            return Response({
                'error': 'You are already registered for this event.',
                'registration_id': existing.registration_id
            }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Reactivate cancelled registration
            existing.status = 'CONFIRMED'
            existing.notes = notes
            existing.save()
            serializer = RegistrationSerializer(existing)
            return Response({
                'message': 'Registration reactivated successfully!',
                'registration': serializer.data
            }, status=status.HTTP_200_OK)

    # Check capacity
    if event.is_full:
        return Response({'error': 'This event has reached its maximum participant limit.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create new registration
    reg = Registration.objects.create(
        student=request.user,
        event=event,
        notes=notes,
        status='CONFIRMED'
    )
    serializer = RegistrationSerializer(reg)
    return Response({
        'message': 'Registration successful!',
        'registration': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def my_registrations_api(request):
    """
    GET /api/my-registrations/
    Returns registrations of the authenticated student.
    """
    if not request.user.is_authenticated or not request.user.is_student:
        return Response({'error': 'Student authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    regs = Registration.objects.filter(student=request.user).select_related('event', 'event__college').order_by('-registered_at')
    serializer = RegistrationSerializer(regs, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
def cancel_registration_api(request, pk):
    """
    DELETE /api/cancel-registration/<id>/
    Allows student to cancel their registration.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        reg = Registration.objects.get(pk=pk, student=request.user)
    except Registration.DoesNotExist:
        return Response({'error': 'Registration not found or unauthorized.'}, status=status.HTTP_404_NOT_FOUND)

    reg.status = 'CANCELLED'
    reg.save()
    return Response({'message': 'Registration cancelled successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
def event_participants_api(request, pk):
    """
    GET /api/events/<id>/participants/
    Allows the college admin of this event to view registered students.
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        event = Event.objects.get(pk=pk)
    except Event.DoesNotExist:
        return Response({'error': 'Event not found.'}, status=status.HTTP_404_NOT_FOUND)

    can_view = request.user.is_superuser or (
        request.user.is_college_admin and (
            event.created_by == request.user or (request.user.college and event.college == request.user.college)
        )
    )
    if not can_view:
        return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    regs = event.registrations.select_related('student').all()
    serializer = RegistrationSerializer(regs, many=True)
    return Response({
        'event_id': event.id,
        'event_title': event.title,
        'registered_count': regs.filter(status='CONFIRMED').count(),
        'max_participants': event.max_participants,
        'participants': serializer.data
    })
