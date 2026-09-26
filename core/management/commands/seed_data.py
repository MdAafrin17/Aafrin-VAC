import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
from core.models import User, College, Event, Registration

class Command(BaseCommand):
    help = "Populate the database with rich sample colleges, events, users, and registrations"

    def handle(self, *args, **options):
        self.stdout.write("Seeding CampusConnect database...")

        # 1. Create Colleges
        colleges_data = [
            {
                "name": "Indian Institute of Technology Madras (IIT Madras)",
                "description": "IIT Madras is one of India's foremost institutes of national importance in technical education, basic and applied research.",
                "address": "IIT P.O., Sardar Patel Road",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "website": "https://www.iitm.ac.in",
                "logo_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=300&auto=format&fit=crop&q=80",
            },
            {
                "name": "College of Engineering, Guindy (Anna University)",
                "description": "CEG is one of the oldest technical institutions in Asia, fostering engineering brilliance, tech symposiums, and cultural heritage.",
                "address": "12, Sardar Patel Rd, Guindy",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "website": "https://www.annauniv.edu",
                "logo_url": "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300&auto=format&fit=crop&q=80",
            },
            {
                "name": "BITS Pilani",
                "description": "Birla Institute of Technology and Science, Pilani is a premier deemed university focused on engineering, entrepreneurship, and innovation.",
                "address": "Vidya Vihar Campus",
                "city": "Pilani",
                "state": "Rajasthan",
                "website": "https://www.bits-pilani.ac.in",
                "logo_url": "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=300&auto=format&fit=crop&q=80",
            },
            {
                "name": "National Institute of Technology Trichy (NIT Trichy)",
                "description": "NIT Trichy is an institute of national importance renowned for its high-octane technical symposiums, research, and campus sports events.",
                "address": "Tanjore Main Road, National Highway 67, near BHEL",
                "city": "Tiruchirappalli",
                "state": "Tamil Nadu",
                "website": "https://www.nitt.edu",
                "logo_url": "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=300&auto=format&fit=crop&q=80",
            },
            {
                "name": "SRM Institute of Science and Technology",
                "description": "SRM IST is a multi-stream university recognized for vibrant student life, global hackathons, cultural fests, and cutting-edge labs.",
                "address": "SRM Nagar, Potheri, Chengalpattu",
                "city": "Kattankulathur",
                "state": "Tamil Nadu",
                "website": "https://www.srmist.edu.in",
                "logo_url": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=300&auto=format&fit=crop&q=80",
            },
            {
                "name": "Delhi Technological University (DTU)",
                "description": "DTU (formerly DCE) is celebrated for its technical brilliance, esports battles, tech festivals, and vibrant collegiate community in Delhi NCR.",
                "address": "Shahbad Daulatpur, Main Bawana Road",
                "city": "New Delhi",
                "state": "Delhi",
                "website": "http://www.dtu.ac.in",
                "logo_url": "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&auto=format&fit=crop&q=80",
            },
            {
                "name": "RV College of Engineering",
                "description": "RVCE Bengaluru is a premier autonomous engineering college known for tech symposiums, robotic clubs, and corporate career conclaves.",
                "address": "Mysore Road, RV Vidyanikethan Post",
                "city": "Bengaluru",
                "state": "Karnataka",
                "website": "https://www.rvce.edu.in",
                "logo_url": "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=300&auto=format&fit=crop&q=80",
            },
            {
                "name": "Loyola College",
                "description": "Loyola College Chennai is ranked among India's top colleges for arts, science, and commerce, famed for cultural showcases and leadership forums.",
                "address": "Sterling Road, Nungambakkam",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "website": "https://www.loyolacollege.edu",
                "logo_url": "https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=300&auto=format&fit=crop&q=80",
            }
        ]

        colleges_dict = {}
        for cdata in colleges_data:
            col, _ = College.objects.update_or_create(
                name=cdata["name"],
                defaults=cdata
            )
            colleges_dict[col.name] = col

        # 2. Create Users
        # Superuser / Admin
        if not User.objects.filter(email="admin@campusconnect.com").exists():
            admin_user = User.objects.create_superuser(
                email="admin@campusconnect.com",
                password="admin123",
                name="Platform Admin",
                username="admin_super",
                phone="+91 9876543210"
            )
            self.stdout.write("Created Superuser: admin@campusconnect.com / admin123")

        # College Admin 1 (IIT Madras)
        iitm_admin, _ = User.objects.update_or_create(
            email="college@iitm.ac.in",
            defaults={
                "name": "Dr. Ramesh Sundaram",
                "role": "COLLEGE_ADMIN",
                "college": colleges_dict["Indian Institute of Technology Madras (IIT Madras)"],
                "username": "iitm_admin",
                "phone": "+91 9444123456",
            }
        )
        iitm_admin.set_password("college123")
        iitm_admin.save()

        # College Admin 2 (Anna University)
        anna_admin, _ = User.objects.update_or_create(
            email="admin@annauniv.edu",
            defaults={
                "name": "Prof. K. Anand",
                "role": "COLLEGE_ADMIN",
                "college": colleges_dict["College of Engineering, Guindy (Anna University)"],
                "username": "anna_admin",
                "phone": "+91 9840123456",
            }
        )
        anna_admin.set_password("college123")
        anna_admin.save()

        # College Admin 3 (BITS Pilani)
        bits_admin, _ = User.objects.update_or_create(
            email="events@pilani.bits-pilani.ac.in",
            defaults={
                "name": "Prof. Shalini Gupta",
                "role": "COLLEGE_ADMIN",
                "college": colleges_dict["BITS Pilani"],
                "username": "bits_admin",
                "phone": "+91 9711123456",
            }
        )
        bits_admin.set_password("college123")
        bits_admin.save()

        # Demo Student 1
        student1, _ = User.objects.update_or_create(
            email="md.aafrin@gmail.com",
            defaults={
                "name": "Md Aafrin",
                "role": "STUDENT",
                "college": colleges_dict["Delhi Technological University (DTU)"],
                "username": "md_aafrin",
                "phone": "+91 9811223344",
            }
        )
        student1.set_password("student123")
        student1.save()

        # Demo Student 2
        student2, _ = User.objects.update_or_create(
            email="rahul.verma@gmail.com",
            defaults={
                "name": "Rahul Verma",
                "role": "STUDENT",
                "college": colleges_dict["SRM Institute of Science and Technology"],
                "username": "rahul_v",
                "phone": "+91 9922334455",
            }
        )
        student2.set_password("student123")
        student2.save()

        self.stdout.write("Created test accounts: college@iitm.ac.in / college123, md.aafrin@gmail.com / student123")

        # 3. Create Events
        today = timezone.localdate()

        events_data = [
            {
                "college": colleges_dict["Indian Institute of Technology Madras (IIT Madras)"],
                "created_by": iitm_admin,
                "title": "InnovateX 2026: National AI & Cloud Hackathon",
                "category": "Hackathon",
                "description": "InnovateX 2026 brings together the brightest undergraduate and postgraduate coders across India to build AI, LLM, and cloud-native solutions tackling healthcare, climate, and fintech challenges. Mentorship by industry leaders, grand cash prize pool of ₹3,00,000, and fast-track recruitment opportunities.",
                "poster_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=7),
                "start_time": datetime.time(9, 0),
                "end_time": datetime.time(20, 0),
                "venue": "IC&SR Auditorium & Research Park",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "registration_fee": 0.00,
                "max_participants": 250,
                "rules": "1. Team size: 2 to 4 members.\n2. Open to all recognized college students across India with valid ID card.\n3. Bring your own laptops and chargers.\n4. Original code only — projects will be scanned with anti-plagiarism checks.\n5. Pre-built templates are strictly prohibited.",
                "registration_deadline": today + datetime.timedelta(days=5),
            },
            {
                "college": colleges_dict["College of Engineering, Guindy (Anna University)"],
                "created_by": anna_admin,
                "title": "Kurukshetra 2026: International Techno-Management Fest",
                "category": "Symposium",
                "description": "Under the patronage of UNESCO, Kurukshetra is the premier student-run techno-management festival. Experience 30+ technical events, robotics arena challenges, open-source paper tracks, and guest lectures by global pioneers.",
                "poster_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=12),
                "start_time": datetime.time(8, 30),
                "end_time": datetime.time(18, 30),
                "venue": "Vivekananda Auditorium, CEG Campus",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "registration_fee": 150.00,
                "max_participants": 500,
                "rules": "1. College ID card is mandatory for campus entry.\n2. Participants can register for multiple sub-events with this pass.\n3. Certificates accredited by Anna University.\n4. Decision of judges will be final and binding.",
                "registration_deadline": today + datetime.timedelta(days=10),
            },
            {
                "college": colleges_dict["BITS Pilani"],
                "created_by": bits_admin,
                "title": "DeepLearn Bootcamp: Hands-on Generative AI & Agents",
                "category": "Workshop",
                "description": "An intensive hands-on 2-day workshop on building Autonomous Multi-Agent AI systems using Python, LangChain, PyTorch, and fine-tuning open-weights models. Participants will deploy a functional agentic app to production.",
                "poster_url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=15),
                "start_time": datetime.time(10, 0),
                "end_time": datetime.time(17, 0),
                "venue": "NAB Computer Center & Lecture Theatre 4",
                "city": "Pilani",
                "state": "Rajasthan",
                "registration_fee": 299.00,
                "max_participants": 120,
                "rules": "1. Prior basic Python programming knowledge is recommended.\n2. Software prerequisites will be emailed 48 hours prior.\n3. Digital participation certificate and code repository access provided.\n4. Lunch and refreshment kit included.",
                "registration_deadline": today + datetime.timedelta(days=13),
            },
            {
                "college": colleges_dict["SRM Institute of Science and Technology"],
                "created_by": None,
                "title": "Milan '26: Annual National Cultural Extravaganza",
                "category": "Cultural",
                "description": "Milan is South India's largest collegiate cultural festival featuring celebrity pro-nights, battle of the bands, western & classical dance choreography, street theatre, fashion shows, and literary contests.",
                "poster_url": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=20),
                "start_time": datetime.time(11, 0),
                "end_time": datetime.time(22, 0),
                "venue": "TP Ganesan Auditorium & Main Grounds",
                "city": "Kattankulathur",
                "state": "Tamil Nadu",
                "registration_fee": 0.00,
                "max_participants": 1000,
                "rules": "1. Open to students of all disciplines.\n2. Entry through digital QR ticket pass generated via CampusConnect.\n3. College dress code and decorum must be strictly adhered to.\n4. No outside food or drinks permitted.",
                "registration_deadline": today + datetime.timedelta(days=18),
            },
            {
                "college": colleges_dict["National Institute of Technology Trichy (NIT Trichy)"],
                "created_by": None,
                "title": "Spardha 2026: All India Inter-Collegiate Sports Championship",
                "category": "Sports",
                "description": "A high-octane 3-day multi-sports meet featuring Basketball, Football, Cricket, Badminton, Table Tennis, and Athletics. Compete against top university teams from across India for the championship trophy.",
                "poster_url": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=25),
                "start_time": datetime.time(7, 0),
                "end_time": datetime.time(19, 0),
                "venue": "Sports Complex & Golden Jubilee Stadium",
                "city": "Tiruchirappalli",
                "state": "Tamil Nadu",
                "registration_fee": 500.00,
                "max_participants": 300,
                "rules": "1. Team registrations require official sign-off from physical education director.\n2. Proper sportswear and footwear mandatory.\n3. Medical waiver must be signed on spot.\n4. Accommodation provided for outstation teams on prior request.",
                "registration_deadline": today + datetime.timedelta(days=22),
            },
            {
                "college": colleges_dict["Delhi Technological University (DTU)"],
                "created_by": None,
                "title": "FragFest: All-India Esports League (Valorant & BGMI)",
                "category": "Gaming",
                "description": "Step into the ultimate LAN arena! Featuring high-refresh gaming rigs, shoutcasting on Twitch/YouTube, and an electric atmosphere with ₹1,50,000 cash pool for college gaming squads.",
                "poster_url": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=9),
                "start_time": datetime.time(10, 0),
                "end_time": datetime.time(21, 0),
                "venue": "B.R. Ambedkar Auditorium",
                "city": "New Delhi",
                "state": "Delhi",
                "registration_fee": 200.00,
                "max_participants": 160,
                "rules": "1. 5 players per team for Valorant; 4 players for BGMI.\n2. Emulators strictly forbidden for BGMI.\n3. In-game toxicity will lead to instant disqualification.\n4. BYO peripherals (headsets, mice, keyboards) permitted.",
                "registration_deadline": today + datetime.timedelta(days=7),
            },
            {
                "college": colleges_dict["RV College of Engineering"],
                "created_by": None,
                "title": "TechnoVision: National Conference on Sustainable Computing",
                "category": "Paper Presentation",
                "description": "Showcase your novel research in green computing, edge intelligence, cybersecurity, and IoT. Accepted papers will be submitted for indexing in reputed IEEE/Springer partner proceedings.",
                "poster_url": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=18),
                "start_time": datetime.time(9, 30),
                "end_time": datetime.time(16, 30),
                "venue": "Civil Engineering Seminar Hall",
                "city": "Bengaluru",
                "state": "Karnataka",
                "registration_fee": 350.00,
                "max_participants": 90,
                "rules": "1. Maximum 3 authors per paper.\n2. Submit abstract in standard IEEE two-column format.\n3. 10 minutes presentation + 5 minutes Q&A with peer reviewers.\n4. Best Paper Award in each track.",
                "registration_deadline": today + datetime.timedelta(days=14),
            },
            {
                "college": colleges_dict["Loyola College"],
                "created_by": None,
                "title": "NextGen Leaders: Campus to Corporate Conclave",
                "category": "Career",
                "description": "Connect with HR leaders from Fortune 500 companies, startup founders, and career coaches. Includes resume critique clinic, mock technical interviews, and on-spot summer internship offerings.",
                "poster_url": "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=14),
                "start_time": datetime.time(9, 0),
                "end_time": datetime.time(17, 30),
                "venue": "Bertram Hall & Placement Cell",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "registration_fee": 0.00,
                "max_participants": 350,
                "rules": "1. Formal corporate attire is compulsory.\n2. Carry 3 printed copies of your resume.\n3. Open to pre-final and final year students of all streams.\n4. Registration ID must be presented at the check-in desk.",
                "registration_deadline": today + datetime.timedelta(days=11),
            },
            {
                "college": colleges_dict["Indian Institute of Technology Madras (IIT Madras)"],
                "created_by": iitm_admin,
                "title": "AeroRobotics: Drone Building & Autonomous Navigation",
                "category": "Technical",
                "description": "Build your own quadcopter drone from scratch! Learn flight dynamics, ESC calibration, sensor fusion, and autonomous path tracking with computer vision in this hands-on technical workshop.",
                "poster_url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=28),
                "start_time": datetime.time(9, 30),
                "end_time": datetime.time(17, 0),
                "venue": "Centre for Innovation (CFI), IITM",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "registration_fee": 499.00,
                "max_participants": 80,
                "rules": "1. Hardware kits will be provided to teams of 4.\n2. Safety goggles must be worn during flight testing.\n3. Take-home certification by IITM CFI mentors.",
                "registration_deadline": today + datetime.timedelta(days=24),
            },
            {
                "college": colleges_dict["College of Engineering, Guindy (Anna University)"],
                "created_by": anna_admin,
                "title": "CodeClash 2026: Speed Coding & Algorithm Sprint",
                "category": "Technical",
                "description": "A thrilling algorithmic coding tournament testing data structures, graph theory, dynamic programming, and optimization. Real-time live leaderboard with immediate problem score feedback.",
                "poster_url": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1000&auto=format&fit=crop&q=80",
                "date": today + datetime.timedelta(days=4),
                "start_time": datetime.time(14, 0),
                "end_time": datetime.time(18, 0),
                "venue": "Department of Computer Science & Engineering",
                "city": "Chennai",
                "state": "Tamil Nadu",
                "registration_fee": 0.00,
                "max_participants": 150,
                "rules": "1. Individual participation only.\n2. Languages supported: C++, Java, Python, Go.\n3. Plagiarism in solution submissions leads to immediate disqualification.",
                "registration_deadline": today + datetime.timedelta(days=3),
            },
        ]

        created_events = []
        for edata in events_data:
            ev, _ = Event.objects.update_or_create(
                title=edata["title"],
                college=edata["college"],
                defaults=edata
            )
            created_events.append(ev)

        # 4. Create Sample Registrations
        # Register student1 (Md Aafrin) for InnovateX and Milan
        reg1, _ = Registration.objects.get_or_create(
            student=student1,
            event=created_events[0],
            defaults={"status": "CONFIRMED", "notes": "Team Alpha - Leader"}
        )
        reg2, _ = Registration.objects.get_or_create(
            student=student1,
            event=created_events[3],
            defaults={"status": "CONFIRMED", "notes": "Attending with 3 friends"}
        )

        # Register student2 (Rahul) for InnovateX and Kurukshetra
        reg3, _ = Registration.objects.get_or_create(
            student=student2,
            event=created_events[0],
            defaults={"status": "CONFIRMED", "notes": "Full-stack developer"}
        )
        reg4, _ = Registration.objects.get_or_create(
            student=student2,
            event=created_events[1],
            defaults={"status": "CONFIRMED", "notes": "Robotics track"}
        )

        self.stdout.write(self.style.SUCCESS(f"Successfully populated database with {College.objects.count()} colleges, {Event.objects.count()} events, and test accounts!"))
