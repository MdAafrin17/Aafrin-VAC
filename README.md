# CampusConnect 🎓
> **India's Premier College Event Discovery & Registration Platform**

CampusConnect is a modern full-stack web application designed to connect universities, event organizers, and passionate students across India. Colleges can publish hackathons, technical symposiums, workshops, cultural fests, esports championships, paper presentations, and career conclaves. Students from any college can discover events tailored by city, state, or category, register with one click, and receive digital QR passes.

---

## 1. Project Description

In the current collegiate landscape, event promotion is fragmented across WhatsApp groups, social media flyers, and messy Google Sheets. **CampusConnect** solves this by offering a unified, high-performance platform:

- **For Colleges:** A dedicated organizer dashboard to publish events, track capacity progress bars, manage registered participants, and export attendee rosters to CSV for venue check-ins.
- **For Students:** A discovery hub to search and filter events across India, view venue agendas and rules, register with instant duplicate-prevention, and download digital tickets with unique verification IDs (`CC-YYYY-XXXXXX`) and QR codes.

---

## 2. Features

### Student Capabilities
- **Account & Profile:** Register with student role and link to your institution (or specify a custom college).
- **Multi-Filtered Event Discovery:**
  - Search by keyword (e.g. `"hackathon"`, `"symposium Chennai"`, `"workshop"`).
  - Filter by Category (Technical, Hackathon, Symposium, Workshop, Cultural, Sports, Gaming, Paper Presentation, Career, Other).
  - Filter by Location (City, State, Across India).
  - Filter by Date (Today, This Week, This Month, All).
  - Filter by Fee (Free entry vs Paid).
  - Sort by date (soonest/latest) or price.
- **Event Details:** Interactive countdown, capacity meter, rules & eligibility guidelines, venue map integration, and host college profiles.
- **Digital Registration Pass:** One-click AJAX registration with instantaneous Ticket Modal displaying:
  - Student Name & College
  - Event Name & Host Institution
  - Event Date, Timings & Campus Venue
  - Unique alphanumeric Pass ID & Scannable QR code
  - Print / Download Pass option
- **Cancellation & Management:** Cancel registrations anytime before the event.

### College Admin Capabilities
- **College Portal & Profile:** Setup college profile with logos, campus address, city, state, website, and institutional overview.
- **Event Creation & Publishing:** Publish events with posters, date/time, max participant caps, registration deadlines, registration fees (or Free), and detailed eligibility rules.
- **Event Management:** Edit and update event details or delete events.
- **Participant Rosters & Analytics:** Live attendee counter, fill percentage bar, attendee list with student details, and 1-click **Export to CSV**.
- **Security & Authorization:** Strict ownership permissions — students cannot create/edit/delete events, and college admins can only manage events belonging to their college.

---

## 3. Technologies

- **Backend:** Python 3.12, Django 6.1, Django REST Framework (DRF)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons, Google Fonts (Plus Jakarta Sans & Outfit)
- **Styling Architecture:** Modern dark theme by default with theme switcher (Dark/Light), ambient cosmic glow, glassmorphic navbar, responsive card layouts, dynamic toast notifications, custom gradient palettes, and printable ticket styles
- **Database:** SQLite (local development), PostgreSQL-ready (`dj-database-url` & `psycopg2-binary`)
- **Static Assets:** WhiteNoise compressed static file handling
- **Security:** Django CSRF protection, PBKDF2 password hashing, role-based permission checks

---

## 4. Installation Steps

### Prerequisites
- Python 3.10+ installed
- Git installed

### Step-by-Step Setup
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "Aafrin VAC project"
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate    # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

---

## 5. Database Setup

1. **Copy the environment configuration:**
   ```bash
   cp .env.example .env
   ```

2. **Apply database migrations:**
   ```bash
   python manage.py makemigrations core
   python manage.py migrate
   ```

3. **Seed realistic sample data (Colleges, Events, and Demo Accounts):**
   ```bash
   python manage.py seed_data
   ```

   This automatically populates 8 premier institutions (IIT Madras, Anna University, BITS Pilani, NIT Trichy, SRM, DTU, RVCE, Loyola College) and 10 diverse events across categories.

### Demo Credentials
| Role | Email | Password |
|---|---|---|
| **Demo Student (Md Aafrin)** | `md.aafrin@gmail.com` | `student123` |
| **Demo Student 2** | `rahul.verma@gmail.com` | `student123` |
| **College Admin (IIT Madras)** | `college@iitm.ac.in` | `college123` |
| **College Admin (Anna University)** | `admin@annauniv.edu` | `college123` |
| **Platform Superuser** | `admin@campusconnect.com` | `admin123` |

*(Note: The login page includes quick 1-click demo buttons to automatically populate these credentials for testing).*

---

## 6. Running Locally

1. **Collect static files:**
   ```bash
   python manage.py collectstatic --noinput
   ```

2. **Start the development server:**
   ```bash
   python manage.py runserver
   ```

3. **Access the application in your browser:**
   - Platform Home: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
   - Event Discovery: [http://127.0.0.1:8000/events/](http://127.0.0.1:8000/events/)
   - Student Dashboard: [http://127.0.0.1:8000/dashboard/student/](http://127.0.0.1:8000/dashboard/student/)
   - College Admin Dashboard: [http://127.0.0.1:8000/dashboard/college/](http://127.0.0.1:8000/dashboard/college/)
   - Django Admin: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

4. **Run Unit Tests:**
   ```bash
   python manage.py test
   ```

---

## 7. API Documentation

CampusConnect provides a full suite of RESTful APIs supporting JSON payloads:

### Events API
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/events/` | List & filter published events (params: `search`, `category`, `city`, `state`, `date_filter`, `fee`) | No |
| `GET` | `/api/events/<id>/` | Retrieve event details | No |
| `POST` | `/api/events/` | Create a new event | Yes (College Admin) |
| `PUT` | `/api/events/<id>/` | Update an existing event | Yes (Owner College Admin) |
| `DELETE` | `/api/events/<id>/` | Delete an event | Yes (Owner College Admin) |

### Colleges API
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/colleges/` | List colleges & universities | No |
| `GET` | `/api/colleges/<id>/` | Retrieve college profile | No |

### Registrations API
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/register-event/` | Register student for an event (Body: `{"event_id": 1, "notes": ""}`) | Yes (Student) |
| `GET` | `/api/my-registrations/` | List authenticated student's registrations | Yes (Student) |
| `DELETE` | `/api/cancel-registration/<id>/` | Cancel registration | Yes (Owner Student) |
| `GET` | `/api/events/<id>/participants/` | List attendee roster for college admin | Yes (Owner College Admin) |

---

## 8. Deployment Instructions

### Production Environment Variables (`.env`)
```env
SECRET_KEY=your-production-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,.onrender.com

# PostgreSQL Connection String
DATABASE_URL=postgresql://dbuser:dbpassword@dbhost:5432/campusconnect
```

### 1-Click Deployment Files Included
The repository includes complete production-ready deployment configurations:
- **`Procfile`**: Production web server runner using Gunicorn (`web: gunicorn campusconnect.wsgi:application --bind 0.0.0.0:$PORT`)
- **`render.yaml`**: Full Blueprint for instant deployment on Render with managed PostgreSQL and web service
- **`build.sh`**: Automated build script executing dependency installation, `collectstatic`, database migrations, and data seeding
- **`Dockerfile` & `docker-compose.yml`**: Containerized production deployment ready for AWS ECS, Google Cloud Run, DigitalOcean, or Docker environments

### Deploying to Render
1. Connect your Git repository to [Render.com](https://render.com).
2. Select **Blueprints** and choose `render.yaml`, or create a **Web Service**:
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn campusconnect.wsgi:application --bind 0.0.0.0:$PORT`
3. Configure Environment Variables (`SECRET_KEY`, `DEBUG=False`, `ALLOWED_HOSTS`, `DATABASE_URL`).

### Deploying to Vercel
CampusConnect is fully configured for serverless deployment on [Vercel](https://vercel.com):
1. **Push your code to GitHub** (`git push origin main`).
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"** -> **"Import"** your `Campus-connect` repository.
3. In **Project Settings**:
   - **Framework Preset**: Other (Vercel automatically detects `vercel.json` and `.python-version`)
   - **Root Directory**: `./` (leave default)
4. Under **Environment Variables**, add:
   - `SECRET_KEY`: A strong random string (e.g. `your-random-secret-key-32-chars-or-more`)
   - `DEBUG`: `False` (or `True` for testing)
   - `ALLOWED_HOSTS`: `*`
   - `DATABASE_URL` *(Optional for persistent Postgres)*: Connection string from [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Aiven](https://aiven.io) (format: `postgresql://user:password@host/dbname?sslmode=require`)
5. Click **"Deploy"**. Vercel will run `build_files.sh`, collect static assets, and deploy the WSGI application with global CDN routing.

### Deploying with Docker
```bash
docker compose up -d --build
```
The application will be accessible at `http://localhost:8000`.
