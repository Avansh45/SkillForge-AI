# SkillForge: Full-Stack Adaptive Learning Platform

SkillForge is a **full-stack, role-based learning and examination platform** built using **React (Frontend)**, **Spring Boot (Backend)**, and **Python FastAPI with AI (AI Service)**. The platform supports Students, Instructors, and Admins with secure authentication, authorization, dashboards, and intelligent question generation.

---

## 📁 Project Architecture

```
SkillForge-AI/
│
├── SkillForge/
│   ├── Frontend/
│   │   └── react-frontend/          (React + Vite SPA)
│   │       ├── src/
│   │       │   ├── components/      (Reusable UI components)
│   │       │   ├── pages/           (Role-based dashboards)
│   │       │   ├── services/        (API communication)
│   │       │   ├── hooks/           (Custom React hooks)
│   │       │   └── utils/           (Helpers & authentication)
│   │       └── package.json
│   │
│   └── SkillForgeBackend/           (Spring Boot REST API)
│       ├── src/main/java/
│       │   ├── controller/          (REST endpoints)
│       │   ├── service/             (Business logic)
│       │   ├── repository/          (Database operations)
│       │   ├── entity/              (JPA entities)
│       │   └── security/            (JWT & authentication)
│       └── pom.xml
│
└── ai-service/                      (Python FastAPI)
    ├── main.py                      (FastAPI server)
    ├── gemini_generator.py          (AI question generation)
    ├── models.py                    (Request/Response schemas)
    ├── requirements.txt
    └── .env                         (Configuration)
```

---

## 🎯 Key Features

### Frontend (React + Vite)
- **Role-Based Dashboards**: Separate interfaces for Students, Instructors, and Admins
- **Course Management**: View, enroll, and manage courses
- **Exam System**: Take exams with AI-generated questions
- **Video Streaming**: Watch course videos
- **Real-time Updates**: Live notifications and performance tracking
- **Responsive Design**: Mobile-friendly UI

### Backend (Spring Boot)
- **REST APIs**: 75+ comprehensive endpoints for all operations
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: STUDENT, INSTRUCTOR, ADMIN roles
- **MySQL Database**: Persistent data storage with JPA/Hibernate
- **Performance Analytics**: Student progress tracking and reporting
- **API Security**: CORS configuration and input validation
- **Assignments & Resources**: Full content management system

### AI Service (Python FastAPI)
- **Intelligent Question Generation**: Uses Google Gemini 2.5 Flash
- **Rate Limiting**: 6 requests per 60 seconds with exponential backoff
- **Question Customization**: Generate 1-100 questions per request
- **Real-time Integration**: Direct integration with backend
- **Error Recovery**: JSON recovery for truncated API responses

---

## 🔐 Authentication & Authorization

### Authentication
- **JWT-Based**: Users receive tokens upon login valid for 24 hours
- **Token Format**: Includes email, role, and expiration
- **Header**: `Authorization: Bearer <JWT_TOKEN>`

### User Roles
| Role | Permissions |
|------|------------|
| **STUDENT** | Enroll courses, take exams, watch videos, submit assignments |
| **INSTRUCTOR** | Create courses, upload videos, manage exams, grade submissions |
| **ADMIN** | Manage all users, courses, analytics, and platform settings |

---

## 💾 Database Schema

**Database Name**: `skillforge_db`

### Core Tables (12+)
| Table | Purpose |
|-------|---------|
| `users` | User profiles with roles and authentication |
| `courses` | Course information and metadata |
| `enrollments` | Student course enrollment records |
| `videos` | Course video resources |
| `exams` | Exam configurations |
| `questions` | Exam questions (manual or AI-generated) |
| `exam_attempts` | Student exam submissions |
| `exam_answers` | Individual question answers |
| `assignments` | Assignment configurations |
| `assignment_submissions` | Student submission records |
| `course_resources` | Study materials and PDFs |
| `batches` | Course batch management |

---

## 🛠 Technology Stack

### Frontend
- React 19.2
- Vite 7.2
- React Router DOM 7.10
- Axios 1.13.2
- ESLint 9.39

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security
- JJWT 0.12.3 (JWT)
- Hibernate/JPA
- MySQL 8.0
- Maven 3.x

### AI Service
- Python 3.12
- FastAPI 0.109
- Uvicorn 0.27
- Google Generative AI SDK
- Pydantic 2.5

---

## 🚀 Getting Started

### Prerequisites
- **Java 17** (for Backend)
- **Node.js 18+** (for Frontend)
- **Python 3.12** (for AI Service)
- **MySQL 8.0** (Database)

### Quick Setup

#### 1. Backend Setup
```bash
cd SkillForge/SkillForgeBackend
mvn clean install
mvn spring-boot:run
# Backend runs on http://localhost:8080
```

#### 2. Frontend Setup
```bash
cd SkillForge/Frontend/react-frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

#### 3. AI Service Setup
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
# AI Service runs on http://localhost:8000
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/change-password` - Change password

### Courses
- `GET /api/courses` - List all courses (public)
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (INSTRUCTOR)
- `POST /api/enrollments` - Enroll in course (STUDENT)

### Exams
- `GET /api/exams` - List exams
- `POST /api/exams` - Create exam (INSTRUCTOR)
- `POST /api/exam-submissions` - Submit exam answers (STUDENT)
- `GET /api/exam-submissions/:id` - Get submission results

### AI Generation
- `POST /api/questions/generate` - Generate questions using AI
- `GET /api/questions/exam/:examId` - Get exam questions

### Analytics
- `GET /api/analytics/student/:studentId` - Student performance metrics
- `GET /api/analytics/course/:courseId` - Course analytics (INSTRUCTOR)

---

## 📊 Database Configuration

Update `SkillForge/SkillForgeBackend/src/main/resources/application.properties`:

```properties
# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db?createDatabaseIfNotExists=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT Configuration
jwt.secret.key=YOUR_SECRET_KEY
jwt.expiration=86400000

# Server Port
server.port=8080
```

---

## 🤖 AI Service Features

- **Intelligent Question Generation**: Uses Google Gemini 2.5 Flash model
- **Question Customization**: Easy, medium, hard difficulty levels
- **Rate Limiting**: 6 requests per 60 seconds
- **Exponential Backoff**: Automatic retry on rate limit or errors
- **JSON Recovery**: Handles truncated API responses
- **Dynamic Timeout**: 2 seconds per question (scales to 200s for 100 questions)
- **Stateless Architecture**: Independent deployment and scaling

### Generation Flow
1. Frontend/Backend requests question generation
2. AI service validates and applies rate limiter
3. Calls Google Gemini API with structured prompt
4. Implements exponential backoff on failures
5. Recovers JSON from truncated responses
6. Returns validated MCQ questions
7. Backend stores questions in database

---

## 🔒 Security Features

- ✅ JWT-based authentication with expiration
- ✅ BCrypt password encryption with salt
- ✅ Role-based API authorization
- ✅ Stateless session management for scalability
- ✅ CORS configured for frontend access
- ✅ Input validation on all endpoints
- ✅ SQL injection protection via JPA parameterized queries
- ✅ Token signature validation on each request
- ✅ Rate limiting on AI service (6 req/60s)

---

## 📈 Project Status

| Component | Status |
|-----------|--------|
| Frontend (React SPA) | ✅ Production Ready |
| Backend (75+ APIs) | ✅ Production Ready |
| Database (MySQL) | ✅ Operational |
| JWT Authentication | ✅ Fully Working |
| Role-Based Authorization | ✅ Enforced |
| AI Service | ✅ Production Ready |
| Rate Limiting | ✅ Active |
| Error Handling | ✅ Comprehensive |
| Analytics | ✅ Integrated |
| Assignments | ✅ Implemented |

---

## 🧪 Testing

### Run Backend Tests
```bash
cd SkillForge/SkillForgeBackend
mvn test
```

### Run Frontend Tests
```bash
cd SkillForge/Frontend/react-frontend
npm test
```

---

## 📝 Documentation

See individual README files for detailed information:
- [Backend Documentation](./SkillForge/SkillForgeBackend/README.md)
- [AI Service Documentation](./ai-service/README.md)

---

## 🎯 Conclusion

SkillForge is a **complete, production-ready full-stack application** demonstrating:

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

>>>>>>> TempBranch
<h2>📁 Project Structure (High Level)</h2>

<pre>
SkillForge-AI/
│
├── old-frontend/          (Archived static HTML/CSS/JS)
<<<<<<< HEAD
=======
│
├── ai-service/            (Python FastAPI with Google Gemini integration)
│   ├── main.py            (FastAPI server with rate limiter)
│   ├── gemini_generator.py (AI question generation engine)
│   ├── models.py          (Request/Response schemas)
│   └── requirements.txt
>>>>>>> TempBranch
│
├── SkillForge/
│   ├── Frontend/
│   │   └── react-frontend/
│   │
│   └── SkillForgeBackend/
│
<<<<<<< HEAD
└── README.html
</pre>

<p>
Only top-level folders are shown for clarity.  
Both frontend and backend are maintained as independent, scalable modules.
</p>
=======
└── README.md
</pre>

<p>
Three independent, scalable modules working together:
</p>
<ul>
  <li><strong>Frontend (React):</strong> SPA with role-based dashboards</li>
  <li><strong>Backend (Spring Boot):</strong> REST APIs with security and analytics</li>
  <li><strong>AI Service (Python FastAPI):</strong> Intelligent question generation with rate limiting</li>
</ul>
>>>>>>> TempBranch

<hr>

<h2>🧩 Frontend Overview (React)</h2>

<p>
The frontend is a <strong>Single Page Application (SPA)</strong> built using React and Vite.
<<<<<<< HEAD
It communicates with the backend using REST APIs and JWT authentication.
=======
It communicates with the backend using REST APIs and JWT authentication, plus integrates
with the AI service for intelligent question generation.
>>>>>>> TempBranch
</p>

<h3>Key Frontend Features</h3>
<ul>
<<<<<<< HEAD
  <li>React + Vite based SPA</li>
  <li>Role-based routing (Student / Instructor / Admin)</li>
  <li>Protected routes using authentication checks</li>
  <li>Login & Register forms integrated with backend APIs</li>
  <li>JWT token handling via browser storage</li>
  <li>Dashboard UI for each role</li>
  <li>Responsive and modular component design</li>
=======
  <li>React + Vite based SPA with modular architecture</li>
  <li>Role-based routing (Student / Instructor / Admin)</li>
  <li>Protected routes using JWT authentication checks</li>
  <li>Login & Register forms integrated with backend APIs</li>
  <li>JWT token handling via browser storage</li>
  <li>Dynamic dashboards for each role with real-time data</li>
  <li>AI-powered exam builder with question generation</li>
  <li>Responsive and modular component design</li>
  <li>Custom hooks for data fetching and state management</li>
  <li>Error handling and API debugging utilities</li>
>>>>>>> TempBranch
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
<<<<<<< HEAD
It exposes REST APIs consumed by the React frontend.
=======
It exposes REST APIs (75+ endpoints) consumed by the React frontend and coordinates
with the AI service for question generation.
>>>>>>> TempBranch
</p>

<h3>Backend Responsibilities</h3>
<ul>
  <li>User authentication and authorization using JWT</li>
  <li>Role-based access control (Student, Instructor, Admin)</li>
<<<<<<< HEAD
  <li>Course management</li>
  <li>Enrollment handling</li>
  <li>Video management (upload & external links)</li>
  <li>Exam and performance tracking</li>
=======
  <li>Course management and resource handling</li>
  <li>Enrollment tracking and batch management</li>
  <li>Video management (upload & external links)</li>
  <li>Exam creation, submission, and scoring</li>
  <li>AI-powered question generation orchestration</li>
  <li>Assignment and submission management</li>
  <li>Performance analytics and student tracking</li>
>>>>>>> TempBranch
  <li>Admin-level user and platform management</li>
</ul>

<hr>

<h2>🗄️ Database (MySQL)</h2>

<p>
SkillForge uses <strong>MySQL</strong> as the primary persistent database.
<<<<<<< HEAD
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
=======
All core data is stored and managed through JPA entities with comprehensive
relationships and constraints.
</p>

<h3>Stored Data Includes (12+ Tables)</h3>
<ul>
  <li>Users and roles with profile information</li>
  <li>Courses with instructors and metadata</li>
  <li>Enrollments and batch management</li>
  <li>Videos with descriptions and links</li>
  <li>Exams with difficulty levels and settings</li>
  <li>Questions (manual and AI-generated) with multiple choice options</li>
  <li>Exam attempts and answer submissions</li>
  <li>Performance data and student tracking</li>
  <li>Assignments and submission tracking</li>
  <li>Course resources (documents, materials)</li>
</ul>

<p>
Spring Data JPA is used for database interaction, ensuring clean and maintainable data access
with optimized queries and transaction management.
>>>>>>> TempBranch
</p>

<hr>

<<<<<<< HEAD
<h2>🔒 Backend Security</h2>

<ul>
  <li>JWT-based authentication</li>
  <li>BCrypt password encryption</li>
  <li>Role-based API authorization</li>
  <li>Stateless session management</li>
  <li>CORS configured for frontend access</li>
=======
<h2>🤖 AI Service Overview (Python FastAPI)</h2>

<p>
The AI service is a standalone <strong>Python FastAPI application</strong> that integrates
with <strong>Google Gemini API</strong> to generate intelligent exam questions.
It implements rate limiting and sophisticated error handling.
</p>

<h3>AI Service Features</h3>
<ul>
  <li>Google Gemini 2.5 Flash model integration</li>
  <li>Generates 1-100 multiple-choice questions per request</li>
  <li>Support for easy, medium, hard difficulty levels</li>
  <li>Server-side rate limiting (6 requests/60 seconds)</li>
  <li>Exponential backoff retry logic for API failures</li>
  <li>JSON recovery with brace-matching for truncated responses</li>
  <li>Dynamic timeout scaling based on question count</li>
  <li>Comprehensive error handling and quota management</li>
  <li>Stateless architecture with independent deployment</li>
</ul>

<h3>Integration Flow</h3>
<ol>
  <li>Frontend/Backend requests question generation</li>
  <li>AI service validates request and applies rate limiter</li>
  <li>Service calls Gemini API with structured prompt</li>
  <li>Implements exponential backoff if rate limited or errors occur</li>
  <li>Recovers JSON from truncated responses</li>
  <li>Returns validated MCQ questions to backend</li>
  <li>Backend stores questions in database</li>
</ol>

<hr>

<h2>🔒 Backend Security</h2>

<ul>
  <li>JWT-based authentication with expiration</li>
  <li>BCrypt password encryption with salt</li>
  <li>Role-based API authorization (STUDENT, INSTRUCTOR, ADMIN)</li>
  <li>Stateless session management for scalability</li>
  <li>CORS configured for frontend access</li>
  <li>Input validation on all endpoints</li>
  <li>SQL injection protection via JPA parameterized queries</li>
>>>>>>> TempBranch
</ul>

<p>
Every protected API requires a valid JWT token in the Authorization header.
<<<<<<< HEAD
=======
Backend validates token signature, expiration, and user role on each request.
>>>>>>> TempBranch
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
<<<<<<< HEAD
  <li>React</li>
  <li>Vite</li>
  <li>JavaScript (ES6+)</li>
  <li>React Router</li>
=======
  <li>React 18+ with Hooks</li>
  <li>Vite (build tool)</li>
  <li>JavaScript (ES6+)</li>
  <li>React Router for navigation</li>
  <li>Axios for HTTP requests</li>
  <li>CSS3 for styling</li>
>>>>>>> TempBranch
</ul>

<h3>Backend</h3>
<ul>
  <li>Java 17</li>
<<<<<<< HEAD
  <li>Spring Boot</li>
  <li>Spring Security</li>
  <li>Spring Data JPA</li>
  <li>JWT</li>
</ul>

<h3>Database</h3>
<ul>
  <li>MySQL</li>
=======
  <li>Spring Boot 3.x</li>
  <li>Spring Security with JWT</li>
  <li>Spring Data JPA / Hibernate</li>
  <li>Maven for dependency management</li>
  <li>JUnit 5 for testing</li>
</ul>

<h3>AI Service</h3>
<ul>
  <li>Python 3.8+</li>
  <li>FastAPI framework</li>
  <li>Google Gemini API (gemini-2.5-flash)</li>
  <li>Pydantic for validation</li>
</ul>

<h3>Database & Persistence</h3>
<ul>
  <li>MySQL 8.0+</li>
  <li>JPA/Hibernate ORM</li>
  <li>Spring Data repositories</li>
>>>>>>> TempBranch
</ul>

<hr>

<<<<<<< HEAD
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
=======
<h2>🚀 How the System Works (End-to-End Flow)</h2>

<h3>Authentication & User Access</h3>
<ol>
  <li>User accesses React frontend at <code>http://localhost:5173</code></li>
  <li>User registers or logs in</li>
  <li>Frontend sends credentials to backend API (<code>http://localhost:8080/api/auth</code>)</li>
  <li>Backend validates user credentials and returns JWT token</li>
  <li>Frontend stores token in browser storage and redirects user</li>
</ol>

<h3>Authenticated Requests & Data Access</h3>
<ol>
  <li>All further requests include JWT token in Authorization header</li>
  <li>Backend validates token signature, expiration, and user role</li>
  <li>If authorized, backend processes request</li>
  <li>Data is fetched from MySQL database</li>
  <li>Response is returned as JSON</li>
</ol>

<h3>AI-Powered Question Generation</h3>
<ol>
  <li>Instructor creates exam via frontend</li>
  <li>Frontend sends question generation request to backend</li>
  <li>Backend calls AI service at <code>http://localhost:8001/generate-questions</code></li>
  <li>AI service applies rate limiter (6 requests/60 seconds)</li>
  <li>AI service calls Google Gemini API with structured prompt</li>
  <li>If rate limited (429), implements exponential backoff retry</li>
  <li>AI service recovers JSON from Gemini response</li>
  <li>Questions are returned to backend</li>
  <li>Backend validates and stores questions in MySQL</li>
  <li>Frontend displays generated questions for instructor review</li>
  <li>Instructor saves or regenerates questions</li>
>>>>>>> TempBranch
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
<<<<<<< HEAD
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


=======
  <li>✅ Frontend: React SPA with role-based dashboards - Production Ready</li>
  <li>✅ Backend: 75+ REST APIs with comprehensive features - Production Ready</li>
  <li>✅ Database: MySQL with 12+ tables and relationships - Operational</li>
  <li>✅ Authentication: JWT-based security - Fully working</li>
  <li>✅ Authorization: Role-based access control - Enforced across all endpoints</li>
  <li>✅ AI Service: Python FastAPI with Gemini integration - Production Ready</li>
  <li>✅ Rate Limiting: Server-side protection (6 req/60s) - Active</li>
  <li>✅ Error Handling: Comprehensive with exponential backoff - Implemented</li>
  <li>✅ Analytics: Student performance tracking - Integrated</li>
  <li>✅ Assignments: Full CRUD with submission tracking - Implemented</li>
</ul>

<h3>Recent Optimizations</h3>
<ul>
  <li>Question generation supports up to 100 questions per request</li>
  <li>Dynamic timeout scaling (2 seconds per question)</li>
  <li>JSON recovery with brace-matching for truncated responses</li>
  <li>Exponential backoff retry logic (5 attempts, 5s-80s waits)</li>
  <li>Backend null-safety annotations for type safety</li>
  <li>Comprehensive API documentation (75+ endpoints)</li>
</ul>

<hr>

<h2>🎯 Conclusion</h2>

<p>
SkillForge is a <strong>complete, production-ready full-stack application</strong> built using modern technologies
and architectural best practices. The project demonstrates:
</p>

<ul>
  <li>🎨 Professional frontend architecture with React and component-based design</li>
  <li>🔧 Scalable backend with Spring Boot, clean architecture, and 75+ REST APIs</li>
  <li>🤖 AI integration with Google Gemini for intelligent question generation</li>
  <li>🛡️ Enterprise-grade security with JWT authentication and role-based authorization</li>
  <li>📊 Comprehensive analytics and performance tracking</li>
  <li>⚡ Optimized rate limiting and error handling for production stability</li>
  <li>📚 Complete assignment and resource management system</li>
  <li>💾 Robust MySQL database with 12+ normalized tables</li>
</ul>

<p>
The three-tier architecture (Frontend → Backend → AI Service) is independently scalable,
fully documented, and ready for deployment to production environments.
</p>
>>>>>>> TempBranch
