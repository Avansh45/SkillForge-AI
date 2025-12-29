package com.skillforge.controller;

import com.skillforge.entity.*;
import com.skillforge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ExamRepository examRepository;
    
    @Autowired
    private ExamAttemptRepository examAttemptRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private EnrollmentRepository enrollmentRepository;
    
    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getPlatformOverview(Authentication authentication) {
        long totalUsers = userRepository.count();
        long students = userRepository.countByRole(User.Role.STUDENT);
        long instructors = userRepository.countByRole(User.Role.INSTRUCTOR);
        long admins = userRepository.countByRole(User.Role.ADMIN);

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalUsers", totalUsers);
        overview.put("students", students);
        overview.put("instructors", instructors);
        overview.put("admins", admins);

        return ResponseEntity.ok(overview);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            User.Role newRole = User.Role.valueOf(request.get("role").toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId, Authentication authentication) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /**
     * NEW ENDPOINT: Get detailed platform statistics
     * Returns comprehensive analytics including exams, courses, enrollments
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getPlatformStatistics(Authentication authentication) {
        Map<String, Object> stats = new HashMap<>();
        
        // User statistics
        stats.put("totalUsers", userRepository.count());
        stats.put("students", userRepository.countByRole(User.Role.STUDENT));
        stats.put("instructors", userRepository.countByRole(User.Role.INSTRUCTOR));
        stats.put("admins", userRepository.countByRole(User.Role.ADMIN));
        
        // Course statistics
        stats.put("totalCourses", courseRepository.count());
        stats.put("totalEnrollments", enrollmentRepository.count());
        
        // Exam statistics
        stats.put("totalExams", examRepository.count());
        stats.put("totalExamAttempts", examAttemptRepository.count());
        stats.put("totalQuestions", questionRepository.count());
        
        // Calculate average score
        List<ExamAttempt> attempts = examAttemptRepository.findAll();
        if (!attempts.isEmpty()) {
            double avgScore = attempts.stream()
                    .mapToDouble(ExamAttempt::getScore)
                    .average()
                    .orElse(0.0);
            stats.put("averageExamScore", Math.round(avgScore * 100.0) / 100.0);
        } else {
            stats.put("averageExamScore", 0.0);
        }
        
        // Recent exam attempts this month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long examsThisMonth = attempts.stream()
                .filter(a -> a.getAttemptedAt().isAfter(startOfMonth))
                .count();
        stats.put("examsThisMonth", examsThisMonth);
        
        return ResponseEntity.ok(stats);
    }

    /**
     * NEW ENDPOINT: Get exam analytics
     * Returns detailed exam performance data
     */
    @GetMapping("/exam-analytics")
    public ResponseEntity<Map<String, Object>> getExamAnalytics(Authentication authentication) {
        Map<String, Object> analytics = new HashMap<>();
        
        List<Exam> exams = examRepository.findAll();
        List<ExamAttempt> attempts = examAttemptRepository.findAll();
        
        // Group attempts by exam
        Map<Long, List<ExamAttempt>> attemptsByExam = attempts.stream()
                .collect(Collectors.groupingBy(a -> a.getExam().getId()));
        
        // Calculate exam-wise statistics
        List<Map<String, Object>> examStats = exams.stream().map(exam -> {
            Map<String, Object> stat = new HashMap<>();
            stat.put("examId", exam.getId());
            stat.put("examTitle", exam.getTitle());
            stat.put("courseTitle", exam.getCourse() != null ? exam.getCourse().getTitle() : "N/A");
            stat.put("totalQuestions", exam.getTotalQuestions());
            stat.put("maxAttempts", exam.getMaxAttempts());
            
            List<ExamAttempt> examAttempts = attemptsByExam.getOrDefault(exam.getId(), Collections.emptyList());
            stat.put("totalAttempts", examAttempts.size());
            
            if (!examAttempts.isEmpty()) {
                double avgScore = examAttempts.stream()
                        .mapToDouble(ExamAttempt::getScore)
                        .average()
                        .orElse(0.0);
                stat.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
                
                long passedCount = examAttempts.stream()
                        .filter(a -> a.getScore() >= 70.0)
                        .count();
                stat.put("passRate", Math.round((passedCount * 100.0 / examAttempts.size()) * 100.0) / 100.0);
            } else {
                stat.put("averageScore", 0.0);
                stat.put("passRate", 0.0);
            }
            
            return stat;
        }).collect(Collectors.toList());
        
        analytics.put("examStatistics", examStats);
        analytics.put("totalExams", exams.size());
        analytics.put("totalAttempts", attempts.size());
        
        return ResponseEntity.ok(analytics);
    }

    /**
     * NEW ENDPOINT: Get recent activity feed
     * Returns latest exam attempts and enrollments
     */
    @GetMapping("/recent-activity")
    public ResponseEntity<List<Map<String, Object>>> getRecentActivity(Authentication authentication) {
        List<Map<String, Object>> activities = new ArrayList<>();
        
        // Get recent exam attempts (last 10)
        List<ExamAttempt> recentAttempts = examAttemptRepository.findAll().stream()
                .sorted((a, b) -> b.getAttemptedAt().compareTo(a.getAttemptedAt()))
                .limit(10)
                .collect(Collectors.toList());
        
        for (ExamAttempt attempt : recentAttempts) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("type", "EXAM_ATTEMPT");
            activity.put("studentName", attempt.getStudent().getName());
            activity.put("examTitle", attempt.getExam().getTitle());
            activity.put("score", attempt.getScore());
            activity.put("timestamp", attempt.getAttemptedAt());
            activity.put("status", attempt.getScore() >= 70 ? "PASSED" : "FAILED");
            activities.add(activity);
        }
        
        // Get recent enrollments (last 10)
        List<Enrollment> recentEnrollments = enrollmentRepository.findAll().stream()
                .sorted((a, b) -> b.getEnrolledAt().compareTo(a.getEnrolledAt()))
                .limit(10)
                .collect(Collectors.toList());
        
        for (Enrollment enrollment : recentEnrollments) {
            Map<String, Object> activity = new HashMap<>();
            activity.put("type", "ENROLLMENT");
            activity.put("studentName", enrollment.getStudent().getName());
            activity.put("courseTitle", enrollment.getCourse().getTitle());
            activity.put("timestamp", enrollment.getEnrolledAt());
            activity.put("status", "ENROLLED");
            activities.add(activity);
        }
        
        // Sort all activities by timestamp
        activities.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
            LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
            return timeB.compareTo(timeA);
        });
        
        // Return top 15 most recent
        return ResponseEntity.ok(activities.stream().limit(15).collect(Collectors.toList()));
    }

    /**
     * NEW ENDPOINT: Get course performance summary
     * Returns enrollment and completion data per course
     */
    @GetMapping("/course-performance")
    public ResponseEntity<List<Map<String, Object>>> getCoursePerformance(Authentication authentication) {
        List<Course> courses = courseRepository.findAll();
        
        List<Map<String, Object>> performance = courses.stream().map(course -> {
            Map<String, Object> data = new HashMap<>();
            data.put("courseId", course.getId());
            data.put("courseTitle", course.getTitle());
            data.put("instructorName", course.getInstructor() != null ? course.getInstructor().getName() : "N/A");
            
            // Get enrollments for this course
            List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
            data.put("totalEnrollments", enrollments.size());
            
            // Get exams for this course
            List<Exam> exams = examRepository.findByCourse(course);
            data.put("totalExams", exams.size());
            
            // Calculate average performance across all exams in this course
            if (!exams.isEmpty()) {
                List<ExamAttempt> courseAttempts = exams.stream()
                        .flatMap(exam -> examAttemptRepository.findByExam(exam).stream())
                        .collect(Collectors.toList());
                
                if (!courseAttempts.isEmpty()) {
                    double avgScore = courseAttempts.stream()
                            .mapToDouble(ExamAttempt::getScore)
                            .average()
                            .orElse(0.0);
                    data.put("averageScore", Math.round(avgScore * 100.0) / 100.0);
                } else {
                    data.put("averageScore", 0.0);
                }
            } else {
                data.put("averageScore", 0.0);
            }
            
            return data;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(performance);
    }
}

