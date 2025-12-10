package com.skillforge.controller;

import com.skillforge.entity.Enrollment;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.User;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ExamAttemptRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getStudentProfile(Authentication authentication) {
        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", student.getId());
        profile.put("name", student.getName());
        profile.put("email", student.getEmail());
        profile.put("role", student.getRole().name());

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        List<ExamAttempt> recentAttempts = examAttemptRepository.findByStudentOrderByAttemptedAtDesc(student);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("student", Map.of(
                "name", student.getName(),
                "email", student.getEmail()
        ));
        dashboard.put("enrolledCourses", enrollments.size());
        dashboard.put("recentAttempts", recentAttempts.stream().limit(5).toList());
        dashboard.put("totalExams", recentAttempts.size());

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/enrollments")
    public ResponseEntity<List<Enrollment>> getMyEnrollments(Authentication authentication) {
        String email = authentication.getName();
        List<Enrollment> enrollments = enrollmentService.getStudentEnrollments(email);
        return ResponseEntity.ok(enrollments);
    }

    @PostMapping("/enroll/{courseId}")
    public ResponseEntity<Map<String, String>> enrollInCourse(@PathVariable Long courseId, Authentication authentication) {
        String email = authentication.getName();
        try {
            enrollmentService.enrollStudent(courseId, email);
            return ResponseEntity.ok(Map.of("message", "Successfully enrolled in course"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unenroll/{courseId}")
    public ResponseEntity<Map<String, String>> unenrollFromCourse(@PathVariable Long courseId, Authentication authentication) {
        String email = authentication.getName();
        try {
            enrollmentService.unenrollStudent(courseId, email);
            return ResponseEntity.ok(Map.of("message", "Successfully unenrolled from course"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

