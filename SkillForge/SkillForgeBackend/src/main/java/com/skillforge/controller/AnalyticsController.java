package com.skillforge.controller;

import com.skillforge.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller for Analytics endpoints
 * Provides comprehensive analytics data for students, instructors, and admins
 * 
 * Security:
 * - Student endpoints return only the authenticated student's data
 * - Instructor endpoints return only data for the instructor's courses
 * - Admin endpoints return global platform statistics
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get comprehensive analytics for the authenticated student
     * 
     * Returns:
     * - Courses enrolled with progress
     * - Exams attempted with scores
     * - Assignments submitted with grades
     * - Overall progress percentage
     * - Performance summary
     * 
     * Security: Only returns data for the authenticated student
     * 
     * @param authentication Spring Security authentication object
     * @return ResponseEntity containing student analytics data
     */
    @GetMapping("/student")
    public ResponseEntity<?> getStudentAnalytics(Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> analytics = analyticsService.getStudentAnalytics(email);
            return ResponseEntity.ok(analytics);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch student analytics",
                "details", e.getMessage()
            ));
        }
    }

    /**
     * Get comprehensive analytics for the authenticated instructor
     * 
     * Returns:
     * - Courses taught with enrollment stats
     * - Total students taught
     * - Assignments created and submissions received
     * - Exams created with attempt statistics
     * - Student performance across courses
     * 
     * Security: Only returns data for courses taught by the authenticated instructor
     * 
     * @param authentication Spring Security authentication object
     * @return ResponseEntity containing instructor analytics data
     */
    @GetMapping("/instructor")
    public ResponseEntity<?> getInstructorAnalytics(Authentication authentication) {
        try {
            String email = authentication.getName();
            Map<String, Object> analytics = analyticsService.getInstructorAnalytics(email);
            return ResponseEntity.ok(analytics);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch instructor analytics",
                "details", e.getMessage()
            ));
        }
    }

    /**
     * Get comprehensive platform analytics for admin
     * 
     * Returns:
     * - Total users by role
     * - Total courses and enrollments
     * - Exam and assignment statistics
     * - System activity trends
     * - Recent platform activities
     * 
     * Security: Only accessible by users with ADMIN role (enforced by Spring Security)
     * 
     * @param authentication Spring Security authentication object (not used, but validates admin role)
     * @return ResponseEntity containing admin analytics data
     */
    @GetMapping("/admin")
    public ResponseEntity<?> getAdminAnalytics(Authentication authentication) {
        try {
            Map<String, Object> analytics = analyticsService.getAdminAnalytics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Failed to fetch admin analytics",
                "details", e.getMessage()
            ));
        }
    }
}
