# SkillForge: AI-Driven Adaptive Learning & Exam Generator

**SkillForge** is a role-based e-learning web application designed to support **students**, **instructors**, and **admins** on a single unified platform.  

The platform focuses on:

- Structured **course and exam workflows**
- **Role-specific dashboards** for different types of users
- A future roadmap for **AI-driven adaptive learning** and **intelligent exam generation**

The current phase of the project delivers a fully functional **frontend application** with **role-based authentication, session handling, and dashboards**, built in a way that can later be connected to a backend and AI services.

---

## 🌐 Project Overview

SkillForge is designed as an end-to-end learning solution where:

- **Students** can manage their learning journey, view progress, and see upcoming exams.
- **Instructors** can manage batches, question banks, and exams.
- **Admins** can oversee platform-wide usage, roles, and performance indicators.

Even though the backend and AI engine are not implemented yet, the **flows, layouts, and UX for these capabilities are already modeled in the UI**, making this a strong foundation for the full system.

---

## 👥 User Roles & Capabilities

### 🧑‍🎓 Student

The Student experience is focused on **learning and self-improvement**.

Currently available on the **Student Dashboard**:

- **Today’s snapshot** section:
  - Active courses and their completion percentage
  - Streaks and accuracy indicators
- **Courses & Learning Paths**:
  - List of assigned courses
  - High-level learning path summary (e.g., placement goal, timeline)
- **Exams**:
  - Upcoming exams with basic details (time, format)
  - Recent attempts with score summaries
- **Analytics & Insights**:
  - Skill-wise performance breakdown
  - Focused recommendations (what to revise, how often)
- **Profile & Preferences**:
  - Shows stored name, email, role
  - Logout from the platform

These sections model how the real system will behave once connected to live data and backend logic.

---

### 🧑‍🏫 Instructor

The Instructor experience focuses on **teaching, assessment design, and monitoring**.

Currently available on the **Instructor Dashboard**:

- **Overview**:
  - List of active teaching batches
  - Key alerts (e.g., low-performing students, participation drops)
- **Courses / Batches**:
  - Question bank overview with topics and difficulty levels
  - Batch-to-question-bank mapping
- **Exam Management**:
  - Recent exams (completed/ongoing/draft)
  - Quick actions (create exams, import questions, publish exams)
- **Class Analytics**:
  - Batch-level performance insights
  - Summary of students needing support
- **Instructor Settings**:
  - Account information
  - Default exam settings (negative marking, shuffling, result visibility)
  - Communication and notification patterns
  - Logout behavior

The UI is structured to later connect to real exam, course, and student data.

---

### 🧑‍💼 Admin

The Admin experience reflects **institute-level control and monitoring**.

Currently available on the **Admin Dashboard**:

- **Institute Overview**:
  - Platform summary (total users, active batches, exam count)
  - User role distribution (students, instructors, admins)
  - Activity highlights (logins, peak usage, question bank size)
- **Courses & Batches Overview**:
  - Course catalog mapped to multiple batches
  - Batch health overview (accuracy, activity, participation)
- **Assessment Activity**:
  - Monthly exam statistics (count, completion rate, average score)
  - Policy overview (negative marking usage, proctoring, result modes)
- **Institute Analytics**:
  - Engagement trends (active users, sessions, most active courses)
  - Risk indicators (low attendance, inactive students, weak courses)
- **Admin Controls**:
  - Admin account details
  - User & Role management overview (pending approvals, role changes, deactivated accounts)
  - Platform settings snapshot (timezone, data export, support contact)
  - Logout behavior

This gives a clear picture of how admins will manage the system once backend APIs are integrated.

---

## 🔐 Authentication & Role Handling (Current Behavior)

Although this project does not yet use a real backend, it already includes **structured authentication behavior on the frontend** using `localStorage`:

- Users can **Sign Up** with:
  - Full Name  
  - Email  
  - Password  
  - Role (`Student`, `Instructor`, or `Admin`)
- Each email is **permanently bound to exactly one role**:
  - If a user registers as a **Student**, they cannot log in as an **Instructor** or **Admin** with the same email.
- On **Sign Up** or **Login**, the app:
  - Validates credentials
  - Creates a session object in `localStorage` (`skillforgeUser`)
  - Redirects the user to the correct dashboard:
    - `Student` → `Dashboards/student.html`
    - `Instructor` → `Dashboards/instructor.html`
    - `Admin` → `Dashboards/admin.html`
- Each dashboard page:
  - Reads the current session
  - Verifies that the stored role matches the dashboard’s role
  - Redirects back to the home page if:
    - No session exists
    - Session expired
    - Role does not match
- Sessions include a timestamp and **expire after a fixed duration** (e.g., 2 hours).
- The **Logout** button:
  - Clears the active session from `localStorage`
  - Redirects the user back to the home page.

This structure mirrors how a real backend-based authentication system will behave and can be replaced later with actual API calls.

---

## ✨ Frontend Features Implemented

### Home Page (`Frontend/HomePage/`)

- Modern **landing page** for SkillForge:
  - Hero section with key value proposition
  - About section explaining adaptive learning
  - Features & benefits cards
  - Course types supported (Java + DSA, Aptitude, Verbal, etc.)
  - AI Engine section describing phases of evolution in education
  - Call-to-Action section
  - Contact form (with frontend “Thank you” confirmation)
- **Navigation:**
  - Sticky header with smooth scrolling to sections
  - Active link highlighting
  - Responsive mobile navigation with hamburger menu
- **Modals:**
  - Login modal (role, email, password)
  - Signup modal (role, name, email, password)
  - Integrated with `localStorage` logic for auth and redirection

### Dashboards (`Frontend/Dashboards/`)

For **Student**, **Instructor**, and **Admin**:

- Consistent layout:
  - Sticky header with logo + role label
  - Navigation bar with sections like Overview, Courses, Exams, Analytics, Settings
  - Responsive design with mobile-friendly nav toggle
- Section-based content:
  - Each dashboard contains multiple sections modeling real information (courses, exams, analytics, settings, etc.)
- Smooth navigation:
  - Clicking nav items scrolls to the corresponding section
  - `scroll-margin-top` used so content is not hidden behind the sticky header on mobile

These pages serve as ready-made frontends that can plug into a backend later.

---

## 🧱 Technologies Used (Current Phase)

**Frontend:**
- HTML5
- CSS3 (custom, responsive, with gradients and card-based UI)
- Vanilla JavaScript (for:
  - navigation
  - modals
  - session and role handling
  - simple user feedback)

**Storage (currently):**
- `localStorage` in the browser for:
  - Registered users (`skillforgeUsers`)
  - Current logged-in session (`skillforgeUser`)

There is **no backend or database** yet — but the code is structured in a way that will make it straightforward to replace `localStorage` with real API calls in the future.

---

## 🧭 Future Vision & Planned Stack

The long-term goal is to evolve SkillForge into a **full-stack, AI-enabled learning platform**.

### Planned Frontend

- **React.js**
  - Component-based structure for dashboards, modals, and forms
  - Better state management for user sessions and analytics
  - API-based data fetching from backend services

### Planned Backend

- **Java + Spring Boot**
  - RESTful APIs for authentication, courses, exams, analytics
  - Role-based access using Spring Security
  - Integration with AI microservices for recommendations and adaptive testing

### Planned Database

- **PostgreSQL** or **MySQL**
  - Persistent storage for:
    - Users & roles
    - Courses & modules
    - Exams & question banks
    - Results & progress history

### Planned AI/ML Integration

- **Python-based AI services**
  - Recommendation models for course suggestions
  - Adaptive exam engines for question selection and difficulty control
  - Analytics models for clustering learners and detecting risk patterns

The current frontend is intentionally designed to align with this architecture.

---

## 📁 Project Structure

```text
Frontend/
  HomePage/
    index.html      # Landing page with login & signup modals
    style.css       # Styling for the home page
    script.js       # Frontend auth, localStorage handling, nav, modals

  Dashboards/
    student.html    # Student role dashboard
    instructor.html # Instructor role dashboard
    admin.html      # Admin role dashboard

README.md           # Project documentation
