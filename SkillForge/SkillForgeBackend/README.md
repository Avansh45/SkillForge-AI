# SkillForge Backend API

Spring Boot REST API backend for the SkillForge Learning Platform.

## Features

- **User Authentication**: JWT-based authentication with role-based access control (Student, Instructor, Admin)
- **Course Management**: Create, update, delete courses
- **Enrollment System**: Students can enroll/unenroll in courses
- **Video Management**: Instructors can upload videos or link YouTube/external videos to courses
- **Exam System**: Create and manage exams
- **Performance Analytics**: Track student performance and progress
- **Batch Management**: Organize students into batches

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- IDE (IntelliJ IDEA, Eclipse, or VS Code)

## Setup Instructions

### 1. Database Setup

Create a MySQL database:

```sql
CREATE DATABASE skillforge_db;
```

Update database credentials in `src/main/resources/application.properties`:

```properties
spring.datasource.username=root
spring.datasource.password=your_password
```

### 2. Build and Run

```bash
# Navigate to backend directory
cd SkillForgeBackend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Student APIs
- `GET /api/students/me` - Get student profile
- `GET /api/students/dashboard` - Get student dashboard
- `GET /api/students/enrollments` - Get enrolled courses
- `POST /api/students/enroll/{courseId}` - Enroll in course
- `POST /api/students/unenroll/{courseId}` - Unenroll from course

### Instructor APIs
- `GET /api/instructors/me` - Get instructor profile
- `GET /api/instructors/dashboard` - Get instructor dashboard
- `GET /api/instructors/courses` - Get instructor's courses
- `POST /api/courses` - Create course
- `POST /api/courses/{courseId}/videos/upload` - Upload video
- `POST /api/courses/{courseId}/videos/link` - Link YouTube/external video

### Admin APIs
- `GET /api/admin/overview` - Get platform overview
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{userId}/role` - Update user role
- `DELETE /api/admin/users/{userId}` - Delete user

### Performance APIs
- `GET /api/performance/overview` - Get performance overview
- `GET /api/performance/recent-attempts` - Get recent exam attempts

### Course APIs
- `GET /api/courses` - Get all courses
- `GET /api/courses/{id}` - Get course by ID
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Video Upload

Videos are stored in the `uploads/videos` directory (configurable in `application.properties`).

For YouTube/external links, use the `/api/courses/{courseId}/videos/link` endpoint with:
```json
{
  "title": "Video Title",
  "description": "Description",
  "videoType": "YOUTUBE",
  "externalUrl": "https://www.youtube.com/watch?v=..."
}
```

## Frontend Integration

The frontend is configured to connect to `http://localhost:8080/api`. Update the `API_BASE_URL` in `Frontend/react-frontend/src/utils/auth.js` if your backend runs on a different port.

## Security

- All passwords are encrypted using BCrypt
- JWT tokens expire after 24 hours (configurable)
- Role-based access control enforced on all endpoints
- CORS configured for frontend origins

## Development

- The application uses Hibernate auto-update mode (`spring.jpa.hibernate.ddl-auto=update`)
- SQL queries are logged in console for debugging
- Hot reload enabled with Spring Boot DevTools

## Notes

- Make sure MySQL is running before starting the application
- The `uploads/videos` directory will be created automatically on first video upload
- Default JWT secret should be changed in production

