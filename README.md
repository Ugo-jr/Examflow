# ExamFlow — Online Examination Management System

A full-stack, production-quality examination platform with role-based access for Students, Instructors, and Admins. Built with React + Vite + Tailwind on the frontend and Django + DRF + PostgreSQL on the backend.

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Axios, Framer Motion, React Icons, Recharts, React Query, React Hot Toast

**Backend:** Django 4.2, Django REST Framework, Simple JWT, PostgreSQL, django-cors-headers, openpyxl (Excel export), reportlab (PDF export)

## Project Structure

```
examflow/
├── backend/
│   ├── examflow/
│   │   ├── settings/
│   │   │   ├── base.py
│   │   │   ├── development.py
│   │   │   └── production.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── users/          # Custom User model, auth, departments
│   │   ├── courses/        # Course + Enrollment
│   │   ├── exams/          # Exam, Question, Option, ExamAttempt, StudentAnswer
│   │   ├── results/        # Result model, grading, analytics, exports
│   │   └── notifications/  # Notification model
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # DashboardLayout (sidebar + topbar)
│   │   │   ├── dashboard/   # NotificationPanel
│   │   │   └── shared/      # StatCard, DataTable, Modal
│   │   ├── pages/
│   │   │   ├── auth/        # Login, Register
│   │   │   ├── student/     # Dashboard, AvailableExams, MyResults, Profile
│   │   │   ├── instructor/  # Dashboard, ManageCourses, ManageExams, CreateExam, ExamQuestions, ViewResults
│   │   │   ├── admin/       # Dashboard, ManageUsers, Courses, Exams, Departments, SystemSettings
│   │   │   └── exam/        # ExamInterface (exam-taking UI), ResultPage
│   │   ├── context/         # AuthContext (JWT), ThemeContext (dark mode)
│   │   ├── services/        # api.js (axios + interceptors), index.js (service functions)
│   │   └── App.jsx          # Role-based routing
│   └── package.json
└── docker-compose.yml
```

## Database Schema

| Table | Key Fields |
|---|---|
| `users_user` | email, first_name, last_name, role, department_id, student_id, profile_picture |
| `users_department` | name, code, description |
| `courses_course` | title, code, instructor_id, department_id, thumbnail |
| `courses_enrollment` | student_id, course_id, enrolled_at, is_active |
| `exams_exam` | title, course_id, instructor_id, duration_minutes, passing_score, status, start/end datetime |
| `exams_question` | exam_id, text, question_type, marks, order, explanation |
| `exams_option` | question_id, text, is_correct, order |
| `exams_examattempt` | student_id, exam_id, status, started_at, submitted_at, time_taken_seconds |
| `exams_studentanswer` | attempt_id, question_id, selected_options (M2M), is_flagged |
| `results_result` | attempt_id, student_id, exam_id, score, percentage, passed, correct/wrong/unanswered counts |
| `notifications_notification` | user_id, title, message, notification_type, is_read |

## REST API Endpoints

### Auth
- `POST /api/auth/register/` — register with role selection
- `POST /api/auth/login/` — returns JWT access + refresh + user object
- `POST /api/auth/token/refresh/`
- `POST /api/auth/logout/` — blacklists refresh token
- `GET/PATCH /api/auth/profile/`
- `PUT /api/auth/change-password/`

### Users (Admin)
- `GET /api/users/` — list, filter by role/department/active
- `POST /api/users/{id}/toggle_active/`
- `GET /api/users/stats/`
- `GET/POST /api/users/departments/`

### Courses
- `GET/POST /api/courses/`
- `GET/PATCH/DELETE /api/courses/{id}/`
- `POST /api/courses/{id}/enroll/` — student self-enroll
- `GET /api/courses/{id}/students/`
- `GET /api/courses/my_courses/`

### Exams
- `GET/POST /api/exams/`
- `GET/PATCH/DELETE /api/exams/{id}/`
- `POST /api/exams/{id}/publish/` — publishes + notifies enrolled students
- `POST /api/exams/{id}/close/`
- `POST /api/exams/{id}/start/` — creates ExamAttempt, returns shuffled questions
- `POST /api/exams/{id}/save_answer/` — auto-save (called every 30s by frontend)
- `POST /api/exams/{id}/submit/` — triggers automatic grading
- `GET/POST/PATCH/DELETE /api/exams/questions/` — question + nested options CRUD

### Results
- `GET /api/results/` — student sees own, instructor sees own exams, admin sees all
- `GET /api/results/{id}/review/` — detailed answer-by-answer breakdown
- `GET /api/results/export_excel/?exam_id=` — openpyxl export
- `GET /api/results/export_pdf/?exam_id=` — reportlab export

### Analytics
- `GET /api/analytics/admin/` — system-wide stats
- `GET /api/analytics/instructor/` — per-instructor stats + per-exam breakdown

### Notifications
- `GET /api/notifications/`
- `POST /api/notifications/{id}/mark_read/`
- `POST /api/notifications/mark_all_read/`
- `GET /api/notifications/unread_count/`

## Key Implementation Details

**Auto-grading:** On submit, `ExamViewSet._grade_attempt()` compares each `StudentAnswer.selected_options` against the question's `is_correct` options, computes score/percentage/pass-fail, and creates a `Result` row — all server-side, instant.

**Auto-save:** The exam interface saves all in-memory answers to the backend every 30 seconds via `setInterval`, plus on every navigation and final submit, so a browser crash never loses more than 30s of progress.

**Auto-submit on timeout:** A `setInterval` countdown in `ExamInterface.jsx` calls `handleAutoSubmit()` when `timeLeft` reaches 0, which saves all answers then submits — no user action required.

**Duplicate submission prevention:** `ExamAttempt.status` transitions from `in_progress` → `submitted`; the submit/save_answer endpoints reject any attempt that's already submitted. `max_attempts` on the Exam model further limits retries.

**Role-based route protection:** `ProtectedRoute` in `App.jsx` checks `user.role` against an allowed list and redirects; backend permissions (`IsStudent`, `IsInstructorOrAdmin`, `IsAdminUser`) double-enforce this server-side.

**JWT refresh flow:** Axios response interceptor in `services/api.js` catches 401s, attempts a silent refresh via the refresh token, retries the original request once, and force-logs-out on failure.

## Local Setup

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit DB credentials
createdb examflow_db
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:8000`.

## AWS Deployment Guide

**Architecture:** S3 + CloudFront (React static build) → ALB → ECS/EC2 (Django via Gunicorn) → RDS PostgreSQL. Media files served from S3.

1. **RDS PostgreSQL** — create a `db.t3.micro` (or larger) instance, note endpoint/credentials, set as `DB_HOST` etc. in backend `.env`.
2. **S3 buckets** — one for the React build (`examflow-frontend`), one for media uploads (`examflow-media`). Enable static website hosting on the frontend bucket or front it with CloudFront.
3. **Backend (ECS Fargate or EC2):**
   - Build the Docker image: `docker build -t examflow-backend ./backend`
   - Push to ECR, deploy as an ECS service behind an Application Load Balancer.
   - Set environment variables (`SECRET_KEY`, `DEBUG=False`, `DB_*`, `AWS_*`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`) via ECS task definition or Secrets Manager.
   - Run `python manage.py migrate` and `collectstatic` as a one-off ECS task on deploy.
4. **Frontend:**
   - `npm run build` produces `dist/`.
   - `aws s3 sync dist/ s3://examflow-frontend --delete`
   - Put CloudFront in front of the bucket for HTTPS + caching; point its origin's `/api/*` behavior at the ALB.
5. **DNS/SSL:** Route53 + ACM certificate on CloudFront and the ALB.
6. **CI/CD:** GitHub Actions building both images on push to `main`, running migrations, then updating the ECS service and S3 bucket.

Alternatively, `docker-compose.yml` in the repo root spins up Postgres + backend + frontend locally or on a single EC2 instance for a simpler deployment.

## Security Checklist

- JWT access (60 min) + refresh (7 days) tokens, refresh rotation + blacklist enabled
- Passwords hashed via Django's PBKDF2 (default `AbstractBaseUser`)
- CORS restricted to known frontend origins; CSRF trusted origins configured
- Role permission classes (`IsStudent`, `IsInstructorOrAdmin`, `IsAdminUser`) on every sensitive endpoint
- Students never see `is_correct` on options or `explanation` during an active attempt (stripped in serializer)
- `ExamAttempt.status` + `max_attempts` prevent duplicate/replay submissions
- Auto-save runs over the authenticated API only, never trusts client-side state for grading
