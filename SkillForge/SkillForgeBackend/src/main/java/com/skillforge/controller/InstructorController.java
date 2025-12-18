package com.skillforge.controller;

import com.skillforge.entity.Batch;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import com.skillforge.repository.BatchRepository;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/instructors")
@CrossOrigin(origins = "*")
public class InstructorController {

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private BatchRepository batchRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getInstructorProfile(Authentication authentication) {
        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", instructor.getId());
        profile.put("name", instructor.getName());
        profile.put("email", instructor.getEmail());
        profile.put("role", instructor.getRole().name());

        return ResponseEntity.ok(profile);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        List<Course> courses = courseRepository.findByInstructor(instructor);
        List<Batch> batches = batchRepository.findByInstructor(instructor);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("instructor", Map.of(
                "name", instructor.getName(),
                "email", instructor.getEmail()
        ));
        dashboard.put("totalCourses", courses.size());
        dashboard.put("totalBatches", batches.size());
        dashboard.put("courses", courses);
        dashboard.put("batches", batches);

        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getMyCourses(Authentication authentication) {
        String email = authentication.getName();
        List<Course> courses = courseService.getCoursesByInstructor(email);
        return ResponseEntity.ok(courses);
    }
}

