
<h1>SkillForge Backend API</h1>

<p>
SkillForge Backend is a Spring Boot REST API that acts as the core backend system
for the SkillForge Learning Platform. It manages authentication, authorization,
users, courses, enrollments, videos, exams, and performance tracking.
</p>

<hr>

<h2>Purpose of the Backend</h2>
<ul>
    <li>Provides REST APIs for frontend applications</li>
    <li>Handles user authentication using JWT</li>
    <li>Implements role-based authorization</li>
    <li>Manages MySQL database operations</li>
    <li>Secures sensitive user data</li>
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
    <li>users</li>
    <li>courses</li>
    <li>enrollments</li>
    <li>videos</li>
    <li>exams</li>
    <li>exam_attempts</li>
    <li>batches</li>
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
        │       ├── dto
        │       ├── entity
        │       ├── repository
        │       ├── security
        │       ├── service
        │       └── SkillForgeBackendApplication.java
        └── resources
            └── application.properties

</pre>

<hr>

<h2>API Endpoints</h2>

<h3>Authentication APIs</h3>
<ul>
    <li>POST /api/auth/register</li>
    <li>POST /api/auth/login</li>
</ul>

<h3>Student APIs</h3>
<ul>
    <li>GET /api/students/me</li>
    <li>GET /api/students/dashboard</li>
    <li>GET /api/students/enrollments</li>
    <li>POST /api/students/enroll/{courseId}</li>
    <li>POST /api/students/unenroll/{courseId}</li>
</ul>

<h3>Instructor APIs</h3>
<ul>
    <li>GET /api/instructors/me</li>
    <li>GET /api/instructors/dashboard</li>
    <li>GET /api/instructors/courses</li>
    <li>POST /api/courses</li>
    <li>POST /api/courses/{courseId}/videos/upload</li>
    <li>POST /api/courses/{courseId}/videos/link</li>
</ul>

<h3>Admin APIs</h3>
<ul>
    <li>GET /api/admin/overview</li>
    <li>GET /api/admin/users</li>
    <li>PUT /api/admin/users/{userId}/role</li>
    <li>DELETE /api/admin/users/{userId}</li>
</ul>

<h3>Course APIs</h3>
<ul>
    <li>GET /api/courses</li>
    <li>GET /api/courses/{id}</li>
    <li>PUT /api/courses/{id}</li>
    <li>DELETE /api/courses/{id}</li>
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
SkillForge Backend is a secure, scalable, and role-based backend system built using
Spring Boot and MySQL. It follows clean architecture principles and supports
real-world learning platform requirements.
</p>
