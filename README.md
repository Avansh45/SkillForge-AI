<<<<<<< HEAD
# SkillForge: AI-Driven Adaptive Learning Platform (React Version)

SkillForge is a fully redesigned role-based adaptive learning and exam platform built using **React**.  
This modern version replaces the old static HTML/CSS/JS website and introduces a scalable, component-driven architecture that is ready for backend + AI integration.

The previous version has been archived safely inside the `old-frontend/` folder.

---

## 📁 Project Structure

```
SkillForge-AI/
│
├── old-frontend/              # Archived old HTML/CSS/JS project
│
├── SkillForge/
│   └── Frontend/
│       └── react-frontend/
│           ├── public/
│           │   └── index.html
│           │
│           ├── src/
│           │   ├── assets/
│           │   │   └── react.svg
│           │   │
│           │   ├── components/
│           │   │   ├── Footer.jsx
│           │   │   ├── Header.jsx
│           │   │   ├── Navbar.jsx
│           │   │   └── ProtectedRoute.jsx
│           │   │
│           │   ├── pages/
│           │   │   ├── Home.jsx
│           │   │   ├── Login.jsx
│           │   │   ├── Signup.jsx
│           │   │   ├── StudentDashboard.jsx
│           │   │   ├── InstructorDashboard.jsx
│           │   │   └── AdminDashboard.jsx
│           │   │
│           │   ├── utils/
│           │   │   └── auth.js
│           │   │
│           │   ├── App.css
│           │   ├── App.jsx
│           │   ├── index.css
│           │   └── main.jsx
│           │
│           ├── package.json
│           ├── vite.config.js
│           └── README.md
```

---

## 🚀 What’s New in the React Version

### ✔️ **Single Page Application (SPA)**
Smooth navigation without page reloads using `react-router-dom`.

### ✔️ **Role-Based Routing & Protection**
Each dashboard is protected using:

- `/student-dashboard`
- `/instructor-dashboard`
- `/admin-dashboard`

Handled by the `ProtectedRoute` component.

### ✔️ **Improved Authentication System**
LocalStorage-based simulation:
- Login / Signup
- Role validation
- Session expiry (2 hours)
- Auto redirect to correct dashboard
- Logout handling

Backend APIs can replace these easily later.

### ✔️ **Component-Based UI**
All common UI parts are modular:

- Header  
- Navbar  
- Footer  
- Modals  
- Dashboard sections  
- Cards  
- Role-based routes  

Much cleaner and easier to maintain.

### ✔️ **Beautiful Responsive UI**
Updated design includes:
- Smooth gradients
- Cards, stats, chips, pills
- Clean dashboards for all roles
- Responsive layout (mobile/desktop)

### ✔️ **Legacy Code Archived Safely**
Your previous HTML/CSS/JS project is moved into:

```
old-frontend/
```

---

## 👥 User Roles & Capabilities

### 🧑‍🎓 Student Dashboard
- Today’s snapshot
- Learning progress
- Upcoming exams
- Recent attempts
- Skill-wise analytics
- AI-based recommendations
- Profile & preferences

### 🧑‍🏫 Instructor Dashboard
- Active batches
- Question banks overview
- Batch/question mapping
- Exam management
- Class analytics
- Instructor preferences

### 🧑‍💼 Admin Dashboard
- Platform summary
- User role distribution
- Monthly exam stats
- Institute-wide analytics
- Role & user management
- Admin preferences

---

## 🔐 Authentication Logic

Handled in `src/utils/auth.js`.

### Current features:
- Register new users
- Login with role matching
- Prevent a single email from registering under multiple roles
- Save session in `localStorage`
- Session timeout after 2 hours
- Role-based dashboard redirection
- Logout clears session
- ProtectedRoute prevents unauthorized access

This mirrors real backend behavior and can be replaced with real APIs later.

---

## 🛠️ How to Run the Project

Inside:

```
SkillForge/Frontend/react-frontend/
```

Run:

```
npm install
npm run dev
```

Then open:

```
http://localhost:5173
```

---

## 🗂️ Why Keep `old-frontend/`?

Your previous static website is stored as:

```
old-frontend/
```

Helpful for:
- Reference  
- Backup  
- Reviewing earlier design  
- Migration history  

---

## 🔧 Technologies Used

### Frontend:
- React + Vite
- JSX
- CSS3 (fully redesigned styles)
- React Router
- LocalStorage API

### Previously:
- HTML / CSS / JavaScript (archived)

---

## 📌 Commit Message for This Migration

Use this when pushing your updated React version:

```
chore: archive old static frontend into old-frontend and migrate project to new React-based structure

- Added modular React components and pages
- Implemented protected routing and role-based dashboards
- Integrated localStorage session/auth system
- Improved UI with modern responsive design
- Cleaned and reorganized project files
```

---

## 📬 Future Plans

### Planned Backend (Java + Spring Boot)
- Authentication APIs
- User roles & permissions
- Course and exam APIs
- Analytics endpoints

### Planned AI Services
- Adaptive difficulty engine
- Recommendations
- Question generation
- Clustering & insights

The current frontend is structured to plug into these features easily.

---

## 📄 License
This project is part of a personal learning project and can be extended freely.

---

## 🎉 Conclusion

Your project is now:
- Cleaner  
- Faster  
- More scalable  
- Ready for backend integration  
- Professionally structured  

The React migration fully modernizes SkillForge and sets a strong foundation for future development.
=======

<h1>SkillForge: Full-Stack Adaptive Learning Platform (React + Spring Boot)</h1>

<p>
SkillForge is a <strong>full-stack, role-based learning and examination platform</strong> built using
<strong>React (Frontend)</strong> and <strong>Spring Boot with MySQL (Backend)</strong>.
The platform supports Students, Instructors, and Admins with secure authentication,
authorization, dashboards, and database-driven APIs.
</p>

<p>
The project has evolved from a static frontend into a <strong>production-style full-stack architecture</strong>
with backend APIs, JWT security, and persistent data storage.
</p>

<hr>

<h2>📁 Project Structure (High Level)</h2>

<pre>
SkillForge-AI/
│
├── old-frontend/          (Archived static HTML/CSS/JS)
│
├── SkillForge/
│   ├── Frontend/
│   │   └── react-frontend/
│   │
│   └── SkillForgeBackend/
│
└── README.html
</pre>

<p>
Only top-level folders are shown for clarity.  
Both frontend and backend are maintained as independent, scalable modules.
</p>

<hr>

<h2>🧩 Frontend Overview (React)</h2>

<p>
The frontend is a <strong>Single Page Application (SPA)</strong> built using React and Vite.
It communicates with the backend using REST APIs and JWT authentication.
</p>

<h3>Key Frontend Features</h3>
<ul>
  <li>React + Vite based SPA</li>
  <li>Role-based routing (Student / Instructor / Admin)</li>
  <li>Protected routes using authentication checks</li>
  <li>Login & Register forms integrated with backend APIs</li>
  <li>JWT token handling via browser storage</li>
  <li>Dashboard UI for each role</li>
  <li>Responsive and modular component design</li>
</ul>

<hr>

<h2>🔐 Authentication & Authorization (Frontend)</h2>

<p>
The frontend integrates directly with backend authentication APIs.
</p>

<ul>
  <li>User login and registration via backend REST APIs</li>
  <li>JWT token received from backend on successful login</li>
  <li>Token stored securely in browser storage</li>
  <li>Authorization header added to every protected API call</li>
  <li>Role-based redirection to correct dashboard</li>
  <li>ProtectedRoute logic prevents unauthorized access</li>
  <li>Logout clears session and token</li>
</ul>

<p>
Frontend behavior mirrors real-world enterprise authentication flow.
</p>

<hr>

<h2>🧠 Backend Overview (Spring Boot)</h2>

<p>
The backend is built using <strong>Java 17 + Spring Boot</strong> and follows a clean layered architecture.
It exposes REST APIs consumed by the React frontend.
</p>

<h3>Backend Responsibilities</h3>
<ul>
  <li>User authentication and authorization using JWT</li>
  <li>Role-based access control (Student, Instructor, Admin)</li>
  <li>Course management</li>
  <li>Enrollment handling</li>
  <li>Video management (upload & external links)</li>
  <li>Exam and performance tracking</li>
  <li>Admin-level user and platform management</li>
</ul>

<hr>

<h2>🗄️ Database (MySQL)</h2>

<p>
SkillForge uses <strong>MySQL</strong> as the primary persistent database.
All core data is stored and managed through JPA entities.
</p>

<h3>Stored Data Includes</h3>
<ul>
  <li>Users and roles</li>
  <li>Courses</li>
  <li>Enrollments</li>
  <li>Videos</li>
  <li>Exams</li>
  <li>Exam attempts and performance data</li>
  <li>Batches</li>
</ul>

<p>
Spring Data JPA is used for database interaction, ensuring clean and maintainable data access.
</p>

<hr>

<h2>🔒 Backend Security</h2>

<ul>
  <li>JWT-based authentication</li>
  <li>BCrypt password encryption</li>
  <li>Role-based API authorization</li>
  <li>Stateless session management</li>
  <li>CORS configured for frontend access</li>
</ul>

<p>
Every protected API requires a valid JWT token in the Authorization header.
</p>

<hr>

<h2>🔗 Frontend ↔ Backend Communication</h2>

<p>
The frontend communicates with the backend using REST APIs.
</p>

<ul>
  <li>Base API URL: <code>http://localhost:8080/api</code></li>
  <li>All protected requests include JWT token</li>
  <li>Backend validates token and role on each request</li>
  <li>JSON used as data exchange format</li>
</ul>

<hr>

<h2>🛠️ Technologies Used</h2>

<h3>Frontend</h3>
<ul>
  <li>React</li>
  <li>Vite</li>
  <li>JavaScript (ES6+)</li>
  <li>React Router</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Java 17</li>
  <li>Spring Boot</li>
  <li>Spring Security</li>
  <li>Spring Data JPA</li>
  <li>JWT</li>
</ul>

<h3>Database</h3>
<ul>
  <li>MySQL</li>
</ul>

<hr>

<h2>🚀 How the System Works (Flow)</h2>

<ol>
  <li>User accesses React frontend</li>
  <li>User registers or logs in</li>
  <li>Frontend sends credentials to backend API</li>
  <li>Backend validates user and returns JWT</li>
  <li>Frontend stores token and redirects user</li>
  <li>All further requests include JWT token</li>
  <li>Backend authorizes requests based on role</li>
  <li>Data is fetched from MySQL and returned</li>
</ol>

<hr>

<h2>📦 Why old-frontend Exists</h2>

<p>
The previous static HTML/CSS/JS project is archived safely in:
</p>

<pre>
old-frontend/
</pre>

<p>
This ensures:
</p>

<ul>
  <li>No data or design loss</li>
  <li>Easy reference for migration</li>
  <li>Clear project evolution history</li>
</ul>

<hr>

<h2>📈 Project Status</h2>

<ul>
  <li>Frontend: Completed & integrated</li>
  <li>Backend APIs: Implemented</li>
  <li>Database: Connected and operational</li>
  <li>Authentication: Fully working</li>
  <li>Authorization: Role-based enforced</li>
</ul>

<hr>

<h2>🎯 Conclusion</h2>

<p>
SkillForge is now a <strong>complete full-stack application</strong> built using modern technologies.
The project follows real-world architecture standards and is ready for
future enhancements such as AI-driven learning and analytics.
</p>

<p>
This setup demonstrates strong understanding of frontend, backend, security,
and database integration in a professional software project.
</p>
>>>>>>> aacea16 (Merge TempBranch changes)
