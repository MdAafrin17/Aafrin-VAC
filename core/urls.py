from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet, basename='api_events')
router.register(r'colleges', views.CollegeViewSet, basename='api_colleges')

urlpatterns = [
    # 1. Landing/Home Page
    path('', views.home_view, name='home'),

    # 2. Event Discovery & 3. Event Details
    path('events/', views.events_discovery_view, name='events_discovery'),
    path('events/<int:pk>/', views.event_detail_view, name='event_detail'),

    # 10. Create Event, 11. Edit Event, Delete Event & Export CSV
    path('events/create/', views.event_create_view, name='event_create'),
    path('events/<int:pk>/edit/', views.event_edit_view, name='event_edit'),
    path('events/<int:pk>/delete/', views.event_delete_view, name='event_delete'),
    path('events/<int:pk>/export-csv/', views.export_event_participants_csv, name='event_export_csv'),

    # 4. College Details Page
    path('colleges/<int:pk>/', views.college_detail_view, name='college_detail'),

    # 5, 6, 7. Authentication Pages
    path('login/', views.login_view, name='login'),
    path('login/student/', views.login_view, {'role_hint': 'student'}, name='student_login'),
    path('login/college/', views.login_view, {'role_hint': 'college'}, name='college_login'),
    path('register/student/', views.student_register_view, name='student_register'),
    path('register/college/', views.college_admin_register_view, name='college_register'),
    path('logout/', views.logout_view, name='logout'),

    # 8. College Admin Dashboard & 9. Student Dashboard
    path('dashboard/college/', views.college_dashboard_view, name='college_dashboard'),
    path('dashboard/student/', views.student_dashboard_view, name='student_dashboard'),

    # 12. My Registrations
    path('my-registrations/', views.my_registrations_view, name='my_registrations'),
    path('registrations/<int:pk>/cancel/', views.cancel_registration_view, name='cancel_registration'),

    # 13. About CampusConnect & 14. Contact Page
    path('about/', views.about_view, name='about'),
    path('contact/', views.contact_view, name='contact'),

    # REST APIs
    path('api/', include(router.urls)),
    path('api/register-event/', views.register_event_api, name='api_register_event'),
    path('api/my-registrations/', views.my_registrations_api, name='api_my_registrations'),
    path('api/cancel-registration/<int:pk>/', views.cancel_registration_api, name='api_cancel_registration'),
    path('api/events/<int:pk>/participants/', views.event_participants_api, name='api_event_participants'),
]
