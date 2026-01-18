
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
├── ai-service/            (Python FastAPI with Google Gemini integration)
│   ├── main.py            (FastAPI server with rate limiter)
│   ├── gemini_generator.py (AI question generation engine)
│   ├── models.py          (Request/Response schemas)
│   └── requirements.txt
│
├── SkillForge/
│   ├── Frontend/
│   │   └── react-frontend/
│   │
│   └── SkillForgeBackend/
│
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

<hr>

<h2>🧩 Frontend Overview (React)</h2>

<p>
The frontend is a <strong>Single Page Application (SPA)</strong> built using React and Vite.
It communicates with the backend using REST APIs and JWT authentication, plus integrates
with the AI service for intelligent question generation.
</p>

<h3>Key Frontend Features</h3>
<ul>
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
It exposes REST APIs (75+ endpoints) consumed by the React frontend and coordinates
with the AI service for question generation.
</p>

<h3>Backend Responsibilities</h3>
<ul>
  <li>User authentication and authorization using JWT</li>
  <li>Role-based access control (Student, Instructor, Admin)</li>
  <li>Course management and resource handling</li>
  <li>Enrollment tracking and batch management</li>
  <li>Video management (upload & external links)</li>
  <li>Exam creation, submission, and scoring</li>
  <li>AI-powered question generation orchestration</li>
  <li>Assignment and submission management</li>
  <li>Performance analytics and student tracking</li>
  <li>Admin-level user and platform management</li>
</ul>

<hr>

<h2>🗄️ Database (MySQL)</h2>

<p>
SkillForge uses <strong>MySQL</strong> as the primary persistent database.
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
</p>

<hr>

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
</ul>

<p>
Every protected API requires a valid JWT token in the Authorization header.
Backend validates token signature, expiration, and user role on each request.
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
  <li>React 18+ with Hooks</li>
  <li>Vite (build tool)</li>
  <li>JavaScript (ES6+)</li>
  <li>React Router for navigation</li>
  <li>Axios for HTTP requests</li>
  <li>CSS3 for styling</li>
</ul>

<h3>Backend</h3>
<ul>
  <li>Java 17</li>
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
</ul>

<hr>

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
