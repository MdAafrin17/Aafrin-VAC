from .models import College, Event, Registration, SavedEvent, Notification
from django.utils import timezone

def global_context(request):
    """Provides common context variables across all templates."""
    context = {
        'all_colleges_count': College.objects.count(),
        'all_events_count': Event.objects.filter(is_published=True).count(),
        'today_date': timezone.localdate(),
        'user_saved_event_ids': set(),
        'unread_notifications_count': 0,
        'user_notifications': [],
    }
    if request.user.is_authenticated:
        context['user_is_student'] = request.user.is_student
        context['user_is_admin'] = request.user.is_college_admin
        
        # Saved events set for quick template check: {% if event.id in user_saved_event_ids %}
        context['user_saved_event_ids'] = set(
            SavedEvent.objects.filter(user=request.user).values_list('event_id', flat=True)
        )
        context['user_notifications'] = Notification.objects.filter(user=request.user)[:5]
        context['unread_notifications_count'] = Notification.objects.filter(user=request.user, is_read=False).count()

        if request.user.is_student:
            context['my_confirmed_count'] = Registration.objects.filter(
                student=request.user, status='CONFIRMED'
            ).count()
        elif request.user.is_college_admin and request.user.college:
            context['my_college_events_count'] = Event.objects.filter(
                college=request.user.college
            ).count()
    return context
