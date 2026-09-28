import datetime
from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from core.models import User, College, Event, Registration

class CampusConnectTestCase(TestCase):
    def setUp(self):
        self.client = Client()

        # Create College
        self.college = College.objects.create(
            name="IIT Madras",
            description="Premier technical institute",
            address="Sardar Patel Road",
            city="Chennai",
            state="Tamil Nadu",
            website="https://www.iitm.ac.in"
        )

        # Create College Admin
        self.college_admin = User.objects.create_user(
            email="admin@iitm.ac.in",
            password="password123",
            name="IITM Admin",
            role="COLLEGE_ADMIN",
            college=self.college
        )

        # Create Student 1
        self.student = User.objects.create_user(
            email="student@example.com",
            password="password123",
            name="John Doe",
            role="STUDENT"
        )

        # Create Student 2
        self.student2 = User.objects.create_user(
            email="student2@example.com",
            password="password123",
            name="Jane Doe",
            role="STUDENT"
        )

        # Create Event
        today = timezone.localdate()
        self.event = Event.objects.create(
            college=self.college,
            created_by=self.college_admin,
            title="AI Hackathon 2026",
            category="Hackathon",
            description="Build modern AI models",
            date=today + datetime.timedelta(days=10),
            start_time=datetime.time(9, 0),
            end_time=datetime.time(18, 0),
            venue="Main Auditorium",
            city="Chennai",
            state="Tamil Nadu",
            registration_fee=0.00,
            max_participants=50,
            registration_deadline=today + datetime.timedelta(days=7),
            rules="Bring your laptop"
        )

    def test_home_page_loads(self):
        response = self.client.get(reverse('home'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Discover College Events")
        self.assertContains(response, "AI Hackathon 2026")

    def test_events_discovery_and_filtering(self):
        # Query matching event
        response = self.client.get(reverse('events_discovery'), {'q': 'Hackathon', 'city': 'Chennai'})
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "AI Hackathon 2026")

        # Query not matching
        response2 = self.client.get(reverse('events_discovery'), {'category': 'Cultural'})
        self.assertEqual(response2.status_code, 200)
        self.assertNotContains(response2, "AI Hackathon 2026")

    def test_student_registration_workflow(self):
        # Student registers for event via API
        self.client.login(username="student@example.com", password="password123")
        res = self.client.post('/api/register-event/', {'event_id': self.event.id}, content_type='application/json')
        self.assertEqual(res.status_code, 201)
        self.assertTrue(Registration.objects.filter(student=self.student, event=self.event, status='CONFIRMED').exists())

        # Duplicate registration attempt should be rejected
        res_dup = self.client.post('/api/register-event/', {'event_id': self.event.id}, content_type='application/json')
        self.assertEqual(res_dup.status_code, 400)
        self.assertIn("already registered", res_dup.json().get('error', ''))

    def test_student_cannot_create_event(self):
        # Students should NOT be able to create events
        self.client.login(username="student@example.com", password="password123")
        res = self.client.get(reverse('event_create'))
        self.assertEqual(res.status_code, 302) # Redirected

    def test_college_admin_can_create_event(self):
        self.client.login(username="admin@iitm.ac.in", password="password123")
        res = self.client.get(reverse('event_create'))
        self.assertEqual(res.status_code, 200)

    def test_cancel_registration(self):
        # Create registration
        reg = Registration.objects.create(student=self.student, event=self.event, status='CONFIRMED')
        self.client.login(username="student@example.com", password="password123")
        
        res = self.client.delete(f'/api/cancel-registration/{reg.id}/')
        self.assertEqual(res.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.status, 'CANCELLED')

    def test_rest_api_events_list(self):
        res = self.client.get('/api/events/')
        self.assertEqual(res.status_code, 200)
        data = res.json()
        results = data.get('results', data)
        self.assertGreaterEqual(len(results), 1)
        self.assertEqual(results[0]['title'], "AI Hackathon 2026")

    def test_multiple_student_registration_unique_usernames(self):
        # Test registering first new student
        res1 = self.client.post(reverse('student_register'), {
            'name': 'New Student 1',
            'email': 'new.student1@example.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'college_name_other': 'Campus Tech'
        })
        self.assertEqual(res1.status_code, 302)

        # Test registering second new student (should never fail with UNIQUE constraint on username)
        self.client.logout()
        res2 = self.client.post(reverse('student_register'), {
            'name': 'New Student 2',
            'email': 'new.student2@example.com',
            'password': 'password123',
            'confirm_password': 'password123',
            'college_name_other': 'Campus Tech'
        })
        self.assertEqual(res2.status_code, 302)

        u1 = User.objects.get(email='new.student1@example.com')
        u2 = User.objects.get(email='new.student2@example.com')
        self.assertTrue(bool(u1.username))
        self.assertTrue(bool(u2.username))
        self.assertNotEqual(u1.username, u2.username)
