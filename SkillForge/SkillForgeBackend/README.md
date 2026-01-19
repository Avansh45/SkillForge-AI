# SkillForge Backend API

SkillForge Backend is a **Spring Boot 3 REST API** that acts as the core backend system for the SkillForge Learning Platform. It manages authentication, authorization, users, courses, enrollments, videos, exams, assignments, AI-powered question generation, analytics, and comprehensive performance tracking.

---

## 🎯 Purpose of the Backend

- **REST APIs**: 75+ endpoints for all operations
- **JWT Authentication**: Secure token-based user authentication
- **Role-Based Authorization**: STUDENT, INSTRUCTOR, ADMIN access control
- **MySQL Database**: Persistent data storage with JPA/Hibernate
- **AI Integration**: Google Gemini for intelligent question generation
- **Performance Analytics**: Student progress tracking and reporting
- **Secure Data**: BCrypt encryption and stateless session management

---

## 🏗 Backend Architecture

```
Client (React / Postman)
        ↓
JWT Authentication Filter
        ↓
Controller Layer (REST APIs)
        ↓
Service Layer (Business Logic)
        ↓
Repository Layer (JPA / Hibernate)
        ↓
MySQL Database
```

---

## 🛠 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17 | Programming language |
| **Spring Boot** | 3.2.0 | Framework |
| **Spring Security** | 3.2.0 | Authentication & Authorization |
| **JWT (JJWT)** | 0.12.3 | Token-based security |
| **Hibernate/JPA** | Latest | ORM & Database abstraction |
| **MySQL** | 8.0+ | Database |
| **Maven** | 3.x | Build automation |
| **BCrypt** | Embedded | Password encryption |

---

## 🔐 Authentication & Authorization

### JWT Authentication Flow
1. User sends credentials to `/api/auth/login`
2. Backend validates and returns JWT token (24-hour expiration)
3. Client stores token in browser
4. All protected requests include: `Authorization: Bearer <JWT_TOKEN>`
5. Backend validates token signature and role on each request

### User Roles
| Role | Permissions |
|------|------------|
| **STUDENT** | Enroll courses, take exams, watch videos, submit assignments |
| **INSTRUCTOR** | Create courses, manage exams, upload resources, grade assignments |
| **ADMIN** | Manage all users, courses, analytics, platform settings |

---

## 💾 Database Schema

**Database Name**: `skillforge_db` (auto-created if `createDatabaseIfNotExists=true`)

### Core Tables (12+)
| Table | Description |
|-------|------------|
| `users` | User profiles with roles (STUDENT, INSTRUCTOR, ADMIN) |
| `courses` | Course information and metadata |
| `enrollments` | Student course enrollment records |
| `videos` | Course video resources (local or external) |
| `exams` | Exam configurations and metadata |
| `questions` | Exam questions (manual or AI-generated) |
| `exam_attempts` | Student exam submission records |
| `exam_answers` | Individual question answers from exam attempts |
| `assignments` | Assignment configurations with due dates |
| `assignment_submissions` | Student assignment submissions |
| `course_resources` | Course study materials and PDFs |
| `batches` | Course batch management |

### Database Configuration
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db?createDatabaseIfNotExists=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

---

## 📁 Project Structure

```
SkillForgeBackend/
├── src/main/java/com/skillforge/
│   ├── controller/           # REST endpoints (13+ controllers)
│   │   ├── AdminController
│   │   ├── AuthController
│   │   ├── StudentController
│   │   ├── InstructorController
│   │   ├── CourseController
│   │   ├── ExamSubmissionController
│   │   ├── QuestionController
│   │   ├── VideoController
│   │   ├── AssignmentController
│   │   ├── AnalyticsController
│   │   └── ...
│   ├── service/              # Business logic (10+ services)
│   │   ├── AuthService
│   │   ├── CourseService
│   │   ├── ExamService
│   │   ├── AiQuestionService
│   │   ├── AnalyticsService
│   │   ├── AssignmentService
│   │   └── ...
│   ├── repository/           # Data access (JPA Repositories)
│   ├── entity/               # JPA entities (12+ entities)
│   ├── security/             # JWT & Spring Security
│   │   ├── JwtAuthenticationFilter
│   │   ├── JwtTokenProvider
│   │   └── SecurityConfig
│   ├── dto/                  # Data Transfer Objects
│   ├── exception/            # Custom exceptions
│   └── SkillForgeBackendApplication.java
├── src/main/resources/
│   └── application.properties
├── uploads/
│   ├── videos/               # Local video storage
│   ├── assignments/          # Assignment submissions
│   └── resources/            # Course materials
└── pom.xml
```

---

## 📚 API Endpoints (75+)

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/change-password` - Change password

### Student Endpoints
- `GET /api/students/me` - Get profile
- `GET /api/students/dashboard` - Dashboard data
- `GET /api/students/enrollments` - Enrolled courses
- `POST /api/students/enroll/{courseId}` - Enroll course
- `POST /api/students/unenroll/{courseId}` - Unenroll course
- `GET /api/students/exams` - Get assigned exams
- `POST /api/students/exams/{examId}/submit` - Submit exam

### Instructor Endpoints
- `GET /api/instructors/me` - Get profile
- `GET /api/instructors/dashboard` - Dashboard overview
- `GET /api/instructors/courses` - My courses
- `POST /api/instructors/courses` - Create course
- `PUT /api/instructors/courses/{courseId}` - Update course
- `DELETE /api/instructors/courses/{courseId}` - Delete course
- `POST /api/instructors/exams` - Create exam
- `POST /api/instructors/exams/{examId}/ai-generate-preview` - AI preview
- `POST /api/instructors/exams/{examId}/ai-generate-save` - AI generate & save
- `GET /api/instructors/exams/{examId}/attempts` - View attempts

### Admin Endpoints
- `GET /api/admin/overview` - Admin overview
- `GET /api/admin/statistics` - Platform statistics
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/{userId}/role` - Update user role
- `DELETE /api/admin/users/{userId}` - Delete user
- `GET /api/admin/courses` - All courses
- `DELETE /api/admin/courses/{courseId}` - Delete course

### Public Course APIs
- `GET /api/courses` - List all courses (public)
- `GET /api/courses/{courseId}` - Course details

### Exam APIs
- `GET /api/exams/{examId}` - Get exam details
- `POST /api/exams/{examId}/submit` - Submit answers
- `GET /api/exams/{examId}/results/{attemptId}` - Get results

### Question APIs
- `POST /api/questions/exam/{examId}` - Create question (INSTRUCTOR)
- `GET /api/questions/exam/{examId}/instructor` - All questions with answers
- `GET /api/questions/exam/{examId}/student` - Questions only (no answers)
- `PUT /api/questions/{questionId}` - Update question
- `DELETE /api/questions/{questionId}` - Delete question

### Assignment APIs
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/course/{courseId}` - Get assignments
- `PUT /api/assignments/{assignmentId}` - Update assignment
- `DELETE /api/assignments/{assignmentId}` - Delete assignment
- `POST /api/assignments/{assignmentId}/submit` - Submit assignment
- `PUT /api/assignments/submissions/{submissionId}/grade` - Grade submission

### Resource APIs
- `POST /api/resources/course/{courseId}/upload` - Upload resource
- `GET /api/resources/course/{courseId}` - Get resources
- `DELETE /api/resources/{resourceId}` - Delete resource
- `GET /api/resources/{resourceId}/download` - Download resource

### Analytics APIs
- `GET /api/analytics` - Platform analytics
- `GET /api/analytics/instructor` - Instructor analytics
- `GET /api/performance` - Student performance

---

## 🤖 AI Integration

### Features
- **Intelligent Question Generation**: Uses Google Gemini 2.5 Flash
- **Flexible Generation**: 1-100 questions per request
- **Difficulty Levels**: Easy, Medium, Hard
- **Rate Limiting**: Protected with exponential backoff retry logic
- **Error Recovery**: Handles truncated API responses

### Integration Points
```
Frontend Request → Backend /api/questions/generate
                → Calls AI Service (http://localhost:8001)
                → Generates with Gemini API
                → Stores in Database
                → Returns to Frontend
```

---

## 📤 File Management

### Video Storage
- **Local Videos**: `uploads/videos/{courseId}/`
- **External Videos**: YouTube/External URL links

### Assignment Submissions
- **Storage Path**: `uploads/assignments/{assignmentId}/`
- **Supported Formats**: PDF, DOC, DOCX, JPG, PNG, etc.

### Course Resources
- **Storage Path**: `uploads/resources/{courseId}/`
- **Supported Formats**: PDF, PPTX, XLS, DOCX, Images

---

## 🔒 Security Features

- ✅ **JWT Authentication**: Token-based, 24-hour expiration
- ✅ **Password Encryption**: BCrypt with salt
- ✅ **Role-Based Authorization**: STUDENT, INSTRUCTOR, ADMIN
- ✅ **Stateless Sessions**: Scalable session management
- ✅ **CORS Configuration**: Frontend origin validation
- ✅ **Input Validation**: All endpoints validate inputs
- ✅ **SQL Injection Protection**: Parameterized JPA queries
- ✅ **Rate Limiting**: AI service protected (6 req/60s)

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Setup & Run

#### 1. Build Backend
```bash
cd SkillForge/SkillForgeBackend
mvn clean install
```

#### 2. Configure Database
Update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db?createDatabaseIfNotExists=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

#### 3. Run Server
```bash
mvn spring-boot:run
```

Server runs on: `http://localhost:8080`

---

## 🧪 Testing

### Run Unit Tests
```bash
mvn test
```

### Using Postman
1. Register user: `POST /api/auth/register`
2. Login: `POST /api/auth/login` → Get JWT token
3. Add to Authorization header: `Bearer <JWT_TOKEN>`
4. Call protected endpoints

---

## 📊 Performance & Analytics

### Student Analytics
- Exam scores and trends
- Course progress tracking
- Assignment submission status
- Performance by topic

### Instructor Analytics
- Course enrollment stats
- Student performance by course
- Exam attempt analytics
- Class average trends

### Admin Analytics
- Platform statistics
- User activity tracking
- Course performance metrics
- System resource usage

---

## 🎯 Key Features

| Feature | Description |
|---------|------------|
| **Authentication** | JWT-based with 24-hour expiration |
| **Authorization** | Role-based (STUDENT, INSTRUCTOR, ADMIN) |
| **Course Management** | Create, update, delete, enroll |
| **Exam System** | Create exams, take exams, auto-scoring |
| **AI Questions** | Google Gemini integration for generation |
| **Assignments** | Create, submit, grade assignments |
| **Videos** | Upload local or link external videos |
| **Analytics** | Comprehensive performance tracking |
| **Resources** | Upload and manage course materials |
| **Security** | BCrypt encryption, JWT, CORS |

---

## 📝 Configuration

### application.properties
```properties
# Server
server.port=8080

# MySQL Database
spring.datasource.url=jdbc:mysql://localhost:3306/skillforge_db?createDatabaseIfNotExists=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JWT
jwt.secret.key=YOUR_SECRET_KEY
jwt.expiration=86400000  # 24 hours

# Upload Folder
file.upload.dir=uploads/
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m "Add feature"`
3. Push: `git push origin feature/name`
4. Submit pull request

---

## 🎓 Conclusion

SkillForge Backend is a **production-ready, comprehensive REST API** that provides:

- ✅ Secure authentication and role-based authorization
- ✅ AI-powered intelligent question generation
- ✅ Complete exam and assignment management
- ✅ Performance analytics and tracking
- ✅ File upload and resource management
- ✅ Scalable architecture following best practices
- ✅ Comprehensive error handling
- ✅ RESTful API design with 75+ endpoints

Perfect for building scalable, secure learning platforms with modern technologies.
