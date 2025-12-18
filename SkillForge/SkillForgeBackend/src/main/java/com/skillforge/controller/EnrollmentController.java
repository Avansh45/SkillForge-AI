package com.skillforge.controller;

import com.skillforge.entity.Enrollment;
import com.skillforge.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@CrossOrigin(origins = "*")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @GetMapping("/my-courses")
    public ResponseEntity<List<Enrollment>> getMyCourses(Authentication authentication) {
        String email = authentication.getName();
        List<Enrollment> enrollments = enrollmentService.getStudentEnrollments(email);
        return ResponseEntity.ok(enrollments);
    }
}

