from .models import College, Event, Registration
from django.utils import timezone

def global_context(request):
    """Provides common context variables across all templates."""
    context = {
        'all_colleges_count': College.objects.count(),
        'all_events_count': Event.objects.filter(is_published=True).count(),
        'today_date': timezone.localdate(),
    }
    if request.user.is_authenticated:
        context['user_is_student'] = request.user.is_student
        context['user_is_admin'] = request.user.is_college_admin
        if request.user.is_student:
            context['my_confirmed_count'] = Registration.objects.filter(
                student=request.user, status='CONFIRMED'
            ).count()
        elif request.user.is_college_admin and request.user.college:
            context['my_college_events_count'] = Event.objects.filter(
                college=request.user.college
            ).count()
    return context
