package com.skillforge.controller;

import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.User;
import com.skillforge.repository.ExamAttemptRepository;
import com.skillforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/performance")
@CrossOrigin(origins = "*")
public class PerformanceController {

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getPerformanceOverview(Authentication authentication) {
        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<ExamAttempt> attempts = examAttemptRepository.findByStudent(student);

        double avgScore = attempts.stream()
                .mapToDouble(a -> a.getPercentage() != null ? a.getPercentage() : 0.0)
                .average()
                .orElse(0.0);

        long totalAttempts = attempts.size();
        long correctAnswers = attempts.stream()
                .mapToLong(a -> a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0)
                .sum();

        Map<String, Object> overview = new HashMap<>();
        overview.put("averageScore", avgScore);
        overview.put("totalAttempts", totalAttempts);
        overview.put("totalCorrectAnswers", correctAnswers);
        overview.put("recentAttempts", attempts.stream().limit(5).toList());

        return ResponseEntity.ok(overview);
    }

    @GetMapping("/recent-attempts")
    public ResponseEntity<List<ExamAttempt>> getRecentAttempts(Authentication authentication) {
        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<ExamAttempt> attempts = examAttemptRepository.findByStudentOrderByAttemptedAtDesc(student);
        return ResponseEntity.ok(attempts.stream().limit(10).toList());
    }
}

