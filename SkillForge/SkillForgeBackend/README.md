
<h1>SkillForge Backend API</h1>

<p>
SkillForge Backend is a Spring Boot REST API that acts as the core backend system
for the SkillForge Learning Platform. It manages authentication, authorization,
users, courses, enrollments, videos, exams, assignments, AI-powered question generation,
analytics, and comprehensive performance tracking.
</p>

<hr>

<h2>Purpose of the Backend</h2>
<ul>
    <li>Provides REST APIs for frontend applications</li>
    <li>Handles user authentication using JWT</li>
    <li>Implements role-based authorization</li>
    <li>Manages MySQL database operations</li>
    <li>Secures sensitive user data</li>
    <li>Integrates AI service for intelligent question generation</li>
    <li>Tracks student performance and analytics</li>
    <li>Manages assignments and course resources</li>
</ul>

<hr>

<h2>Backend Working Flow</h2>

<pre>
Client (React / Postman)
        |
        v
JWT Authentication Filter
        |
        v
Controller Layer (REST APIs)
        |
        v
Service Layer (Business Logic)
        |
        v
Repository Layer (JPA / Hibernate)
        |
        v
MySQL Database
</pre>

<hr>

<h2>Technologies Used</h2>

<ul>
    <li>Java 17</li>
    <li>Spring Boot 3</li>
    <li>Spring Security</li>
    <li>JWT (JSON Web Token)</li>
    <li>Hibernate / JPA</li>
    <li>MySQL Database</li>
    <li>Maven</li>
    <li>BCrypt Password Encoder</li>
    <li>REST API Architecture</li>
</ul>

<hr>

<h2>Authentication</h2>

<p>
Authentication is implemented using JWT (JSON Web Token).
When a user logs in successfully, the backend generates a token that contains
the user's email, role, and expiration time.
</p>

<p>
The client must send this token in the Authorization header for all protected APIs.
</p>

<pre>
Authorization: Bearer &lt;JWT_TOKEN&gt;
</pre>

<hr>

<h2>Authorization</h2>

<p>
Authorization is role-based. Each API is protected based on user roles.
</p>

<h3>User Roles</h3>
<ul>
    <li>STUDENT</li>
    <li>INSTRUCTOR</li>
    <li>ADMIN</li>
</ul>

<h3>Role Access</h3>
<ul>
    <li>Student: Enroll courses, view dashboard, watch videos</li>
    <li>Instructor: Create courses, upload videos, manage exams</li>
    <li>Admin: Manage users, roles, and platform data</li>
</ul>

<hr>

<h2>Database (MySQL)</h2>

<p>
The backend uses MySQL as the relational database.
</p>

<h3>Database Name</h3>
<pre>skillforge_db</pre>

<h3>Main Tables</h3>
<ul>
    <li>users - User profiles with roles (STUDENT, INSTRUCTOR, ADMIN)</li>
    <li>courses - Course information managed by instructors</li>
    <li>enrollments - Student course enrollments</li>
    <li>videos - Course video resources</li>
    <li>exams - Exam configurations and metadata</li>
    <li>questions - Exam questions (manual or AI-generated)</li>
    <li>exam_attempts - Student exam submission records</li>
    <li>exam_answers - Individual question answers from exam attempts</li>
    <li>assignments - Assignment configurations</li>
    <li>assignment_submissions - Student assignment submissions</li>
    <li>course_resources - Course study materials and PDFs</li>
    <li>batches - Course batch management</li>
</ul>

<h3>Database Configuration</h3>
<pre>
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=validate
</pre>

<hr>

<h2>Project Structure</h2>

<pre>
SkillForgeBackend
└── src
    └── main
        ├── java
        │   └── com.skillforge
        │       ├── controller
        │       │   ├── AdminController.java
        │       │   ├── AnalyticsController.java
        │       │   ├── AuthController.java
        │       │   ├── ContactController.java
        │       │   ├── CourseController.java
        │       │   ├── CourseResourceController.java
        │       │   ├── EnrollmentController.java
        │       │   ├── ExamSubmissionController.java
        │       │   ├── InstructorController.java
        │       │   ├── PerformanceController.java
        │       │   ├── QuestionController.java
        │       │   ├── StudentController.java
        │       │   └── VideoController.java
        │       ├── dto
        │       ├── entity
        │       ├── exception
        │       ├── repository
        │       ├── security
        │       ├── service
        │       │   ├── AiQuestionService.java
        │       │   ├── AnalyticsService.java
        │       │   ├── AssignmentService.java
        │       │   ├── AuthService.java
        │       │   ├── CourseResourceService.java
        │       │   ├── CourseService.java
        │       │   ├── EnrollmentService.java
        │       │   ├── ExamService.java
        │       │   ├── SubmissionService.java
        │       │   └── VideoService.java
        │       └── SkillForgeBackendApplication.java
        └── resources
            └── application.properties
└── uploads
    ├── assignments/
    ├── resources/
    └── videos/
</pre>

<hr>

<h2>API Endpoints</h2>

<h3>Authentication APIs</h3>
<ul>
    <li>POST /api/auth/register - Register new user</li>
    <li>POST /api/auth/login - Login and get JWT token</li>
</ul>

<h3>Student APIs</h3>
<ul>
    <li>GET /api/students/me - Get student profile</li>
    <li>GET /api/students/dashboard - Get student dashboard data</li>
    <li>GET /api/students/enrollments - Get enrolled courses</li>
    <li>POST /api/students/enroll/{courseId} - Enroll in course</li>
    <li>POST /api/students/unenroll/{courseId} - Unenroll from course</li>
    <li>GET /api/students/exams - Get student exams</li>
    <li>POST /api/students/exams/{examId}/submit - Submit exam</li>
</ul>

<h3>Instructor APIs</h3>
<ul>
    <li>GET /api/instructors/me - Get instructor profile</li>
    <li>GET /api/instructors/dashboard - Get instructor dashboard</li>
    <li>GET /api/instructors/courses - Get instructor's courses</li>
    <li>POST /api/instructors/courses - Create new course</li>
    <li>PUT /api/instructors/courses/{courseId} - Update course</li>
    <li>DELETE /api/instructors/courses/{courseId} - Delete course</li>
    <li>POST /api/instructors/exams - Create exam</li>
    <li>PUT /api/instructors/exams/{examId} - Update exam</li>
    <li>DELETE /api/instructors/exams/{examId} - Delete exam</li>
    <li>POST /api/instructors/exams/{examId}/ai-generate-preview - AI preview questions</li>
    <li>POST /api/instructors/exams/{examId}/ai-generate-save - AI generate and save questions</li>
    <li>GET /api/instructors/exams/{examId}/attempts - View exam attempts</li>
</ul>

<h3>Admin APIs</h3>
<ul>
    <li>GET /api/admin/overview - Admin dashboard overview</li>
    <li>GET /api/admin/statistics - Detailed platform statistics</li>
    <li>GET /api/admin/users - Get all users</li>
    <li>PUT /api/admin/users/{userId}/role - Update user role</li>
    <li>DELETE /api/admin/users/{userId} - Delete user</li>
    <li>GET /api/admin/courses - Get all courses</li>
    <li>GET /api/admin/exams - Get all exams</li>
    <li>DELETE /api/admin/courses/{courseId} - Delete course</li>
    <li>DELETE /api/admin/exams/{examId} - Delete exam</li>
</ul>

<h3>Course APIs</h3>
<ul>
    <li>GET /api/courses - Get all courses</li>
    <li>GET /api/courses/{id} - Get course details</li>
    <li>PUT /api/courses/{id} - Update course</li>
    <li>DELETE /api/courses/{id} - Delete course</li>
</ul>

<h3>Exam APIs</h3>
<ul>
    <li>POST /api/exams - Create exam</li>
    <li>GET /api/exams/{examId} - Get exam details</li>
    <li>POST /students/exams/{examId}/submit - Submit exam answers</li>
    <li>GET /students/exams/{examId}/results/{attemptId} - Get exam results</li>
</ul>

<h3>Question APIs (Instructor)</h3>
<ul>
    <li>POST /api/questions/exam/{examId} - Create question</li>
    <li>PUT /api/questions/{questionId} - Update question</li>
    <li>DELETE /api/questions/{questionId} - Delete question</li>
    <li>GET /api/questions/exam/{examId}/instructor - Get all questions (with answers)</li>
</ul>

<h3>Question APIs (Student)</h3>
<ul>
    <li>GET /api/questions/exam/{examId}/student - Get questions (no answers)</li>
</ul>

<h3>Assignment APIs</h3>
<ul>
    <li>POST /api/assignments - Create assignment</li>
    <li>GET /api/assignments/course/{courseId} - Get course assignments</li>
    <li>PUT /api/assignments/{assignmentId} - Update assignment</li>
    <li>DELETE /api/assignments/{assignmentId} - Delete assignment</li>
    <li>POST /api/assignments/{assignmentId}/submit - Submit assignment</li>
    <li>PUT /api/assignments/submissions/{submissionId}/grade - Grade submission</li>
</ul>

<h3>Course Resource APIs</h3>
<ul>
    <li>POST /api/resources/course/{courseId}/upload - Upload resource</li>
    <li>GET /api/resources/course/{courseId} - Get course resources</li>
    <li>DELETE /api/resources/{resourceId} - Delete resource</li>
    <li>GET /api/resources/{resourceId}/download - Download resource</li>
</ul>

<h3>Video APIs</h3>
<ul>
    <li>GET /api/videos/course/{courseId} - Get course videos</li>
    <li>POST /api/videos/course/{courseId} - Add video</li>
    <li>DELETE /api/videos/{videoId} - Delete video</li>
</ul>

<h3>Analytics & Performance APIs</h3>
<ul>
    <li>GET /api/analytics - Get platform analytics</li>
    <li>GET /api/analytics/instructor - Get instructor analytics</li>
    <li>GET /api/performance - Get student performance</li>
</ul>

<hr>

<h2>Video Management</h2>

<p>
Videos can be uploaded locally or linked from external sources like YouTube.
</p>

<h3>Local Storage</h3>
<pre>uploads/videos/</pre>

<h3>External Video Example</h3>
<pre>
{
  "title": "Spring Boot Basics",
  "description": "Introduction video",
  "videoType": "YOUTUBE",
  "externalUrl": "https://www.youtube.com/watch?v=xxxx"
}
</pre>

<hr>

<h2>AI-Powered Question Generation</h2>

<p>
The backend integrates with Google Gemini AI service to generate exam questions automatically.
</p>

<h3>Features</h3>
<ul>
    <li>Generate questions by course, topic, and difficulty</li>
    <li>Generate 1-100 questions in a single request</li>
    <li>Support for multiple difficulty levels (Easy, Medium, Hard)</li>
    <li>Automatic question validation and parsing</li>
    <li>Rate limiting to protect API quota</li>
    <li>Exponential backoff retry logic for resilience</li>
</ul>

<h3>AI Question Generation Endpoints</h3>
<ul>
    <li>POST /api/instructors/exams/{examId}/ai-generate-preview - Preview AI questions</li>
    <li>POST /api/instructors/exams/{examId}/ai-generate-save - Generate and save questions</li>
</ul>

<h3>AI Service Integration</h3>
<pre>
POST http://localhost:8001/generate-questions
{
  "courseName": "Python Programming",
  "topic": "Loops and Lists",
  "difficulty": "medium",
  "numberOfQuestions": 10
}
</pre>

<hr>

<h2>Assignments & Submissions</h2>

<p>
Instructors can create assignments and students can submit them.
</p>

<h3>Features</h3>
<ul>
    <li>Create assignments with due dates and max marks</li>
    <li>Students submit assignments with file uploads</li>
    <li>Instructors grade submissions and provide feedback</li>
    <li>Track submission status and grades</li>
</ul>

<h3>Storage</h3>
<pre>uploads/assignments/{assignmentId}/</pre>

<hr>

<h2>Course Resources</h2>

<p>
Instructors can upload study materials and resources for courses.
</p>

<h3>Features</h3>
<ul>
    <li>Upload PDF documents and study materials</li>
    <li>Organize resources by course</li>
    <li>Download and preview resources</li>
    <li>Track resource access</li>
</ul>

<h3>Storage</h3>
<pre>uploads/resources/{courseId}/</pre>

<hr>

<h2>Analytics & Performance Tracking</h2>

<p>
Comprehensive analytics for students, instructors, and admins.
</p>

<h3>Student Analytics</h3>
<ul>
    <li>Exam scores and performance trends</li>
    <li>Course progress tracking</li>
    <li>Assignment submission status</li>
</ul>

<h3>Instructor Analytics</h3>
<ul>
    <li>Course enrollment statistics</li>
    <li>Student performance by course</li>
    <li>Exam attempt analytics</li>
</ul>

<h3>Admin Analytics</h3>
<ul>
    <li>Platform-wide statistics</li>
    <li>User activity tracking</li>
    <li>Course and exam performance metrics</li>
</ul>

<hr>

<h2>How to Run the Backend</h2>

<pre>
mvn clean install
mvn spring-boot:run
</pre>

<p>
Server URL:
</p>

<pre>
http://localhost:8080
</pre>

<hr>

<h2>Testing Using Postman</h2>

<ol>
    <li>Register a user</li>
    <li>Login and get JWT token</li>
    <li>Add token to Authorization header</li>
    <li>Call protected APIs</li>
</ol>

<hr>

<h2>Security Features</h2>

<ul>
    <li>BCrypt password encryption</li>
    <li>JWT-based authentication</li>
    <li>Stateless session management</li>
    <li>Role-based API protection</li>
    <li>CORS configuration for frontend</li>
</ul>

<hr>

<h2>Conclusion</h2>

<p>
SkillForge Backend is a comprehensive, secure, and scalable backend system built using
Spring Boot and MySQL. It features:
</p>

<ul>
    <li>Role-based access control for Students, Instructors, and Admins</li>
    <li>JWT-based authentication with stateless sessions</li>
    <li>AI-powered intelligent question generation</li>
    <li>Complete exam management with scoring and analytics</li>
    <li>Assignment and resource management for courses</li>
    <li>Performance tracking and detailed analytics</li>
    <li>Scalable architecture following clean code principles</li>
    <li>Comprehensive error handling and security features</li>
</ul>

<p>
The platform is designed to support real-world learning scenarios with robust data management,
secure API endpoints, and integration with AI services for enhanced learning experiences.
</p>
