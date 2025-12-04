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
