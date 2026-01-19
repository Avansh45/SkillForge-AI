package com.skillforge.controller;

import com.skillforge.entity.Enrollment;
import com.skillforge.entity.Exam;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.Question;
import com.skillforge.entity.User;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.ExamAttemptRepository;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.QuestionRepository;
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

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

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

    @GetMapping("/exams")
    public ResponseEntity<List<Map<String, Object>>> getStudentExams(Authentication authentication) {
        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Get all enrollments for the student
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);

        // Get all exams for enrolled courses
        List<Exam> availableExams = enrollments.stream()
                .map(enrollment -> examRepository.findByCourse(enrollment.getCourse()))
                .flatMap(List::stream)
                .distinct()
                .toList();

        // Get student's exam attempts
        List<ExamAttempt> attempts = examAttemptRepository.findByStudentOrderByAttemptedAtDesc(student);

        // Format response with exam details and attempt status
        List<Map<String, Object>> examData = availableExams.stream()
                .map(exam -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", exam.getId());
                    data.put("title", exam.getTitle());
                    data.put("description", exam.getDescription());
                    data.put("startTime", exam.getStartTime());
                    data.put("endTime", exam.getEndTime());
                    data.put("durationMinutes", exam.getDurationMinutes());
                    data.put("totalQuestions", exam.getTotalQuestions());
                    data.put("maxAttempts", exam.getMaxAttempts());

                    // Course info
                    data.put("course", Map.of(
                            "id", exam.getCourse().getId(),
                            "title", exam.getCourse().getTitle()
                    ));

                    // Attempt info
                    List<ExamAttempt> examAttempts = attempts.stream()
                            .filter(attempt -> attempt.getExam().getId().equals(exam.getId()))
                            .toList();
                    data.put("attemptCount", examAttempts.size());
                    data.put("hasAttempted", !examAttempts.isEmpty());

                    if (!examAttempts.isEmpty()) {
                        ExamAttempt latestAttempt = examAttempts.get(0);
                        data.put("latestScore", latestAttempt.getScore());
                        data.put("score", latestAttempt.getScore()); // For compatibility
                        data.put("percentage", latestAttempt.getScore()); // For compatibility
                        data.put("submittedAt", latestAttempt.getAttemptedAt());
                        data.put("updatedAt", latestAttempt.getAttemptedAt());
                        data.put("latestAttemptDate", latestAttempt.getAttemptedAt());
                        data.put("status", "COMPLETED");
                    }

                    return data;
                })
                .toList();

        return ResponseEntity.ok(examData);
    }

    @GetMapping("/exams/{examId}")
    public ResponseEntity<Map<String, Object>> getExamDetails(@PathVariable Long examId, Authentication authentication) {
        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Verify student is enrolled in the course
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        boolean isEnrolled = enrollments.stream()
                .anyMatch(e -> e.getCourse().getId().equals(exam.getCourse().getId()));

        if (!isEnrolled) {
            throw new RuntimeException("You are not enrolled in this course");
        }

        // Get student's attempts for this exam
        List<ExamAttempt> attempts = examAttemptRepository.findByStudentOrderByAttemptedAtDesc(student)
                .stream()
                .filter(attempt -> attempt.getExam().getId().equals(examId))
                .toList();

        // Check if student can take the exam
        if (attempts.size() >= exam.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts reached for this exam");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("id", exam.getId());
        data.put("title", exam.getTitle());
        data.put("description", exam.getDescription());
        data.put("startTime", exam.getStartTime());
        data.put("endTime", exam.getEndTime());
        data.put("durationMinutes", exam.getDurationMinutes());
        data.put("totalQuestions", exam.getTotalQuestions());
        data.put("maxAttempts", exam.getMaxAttempts());
        data.put("negativeMarking", exam.getNegativeMarking());

        data.put("course", Map.of(
                "id", exam.getCourse().getId(),
                "title", exam.getCourse().getTitle()
        ));

        data.put("attemptCount", attempts.size());
        data.put("canAttempt", attempts.size() < exam.getMaxAttempts());

        return ResponseEntity.ok(data);
    }

    @PostMapping("/exams/{examId}/submit")
    public ResponseEntity<Map<String, Object>> submitExam(
            @PathVariable Long examId,
            @RequestBody Map<String, Object> submissionData,
            Authentication authentication) {

        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Verify student is enrolled
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        boolean isEnrolled = enrollments.stream()
                .anyMatch(e -> e.getCourse().getId().equals(exam.getCourse().getId()));

        if (!isEnrolled) {
            throw new RuntimeException("You are not enrolled in this course");
        }

        // Check max attempts
        List<ExamAttempt> attempts = examAttemptRepository.findByStudentOrderByAttemptedAtDesc(student)
                .stream()
                .filter(attempt -> attempt.getExam().getId().equals(examId))
                .toList();

        if (attempts.size() >= exam.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts reached for this exam");
        }

        // Get student answers
        @SuppressWarnings("unchecked")
        Map<String, String> studentAnswers = (Map<String, String>) submissionData.get("answers");
        
        // Calculate score by comparing with correct answers
        List<Question> examQuestions = questionRepository.findByExamOrderByQuestionOrderAsc(exam);
        int correctCount = 0;
        int wrongCount = 0;
        
        for (Question question : examQuestions) {
            String studentAnswer = studentAnswers != null ? studentAnswers.get(String.valueOf(question.getId())) : null;
            if (studentAnswer != null) {
                if (studentAnswer.equals(question.getCorrectOption())) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            } else {
                wrongCount++; // Unanswered = wrong
            }
        }
        
        // Create exam attempt
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setStudent(student);
        attempt.setAttemptedAt(java.time.LocalDateTime.now());

        Integer timeTaken = (Integer) submissionData.get("timeTakenMinutes");
        
        attempt.setTimeTakenMinutes(timeTaken);
        attempt.setCorrectAnswers(correctCount);
        attempt.setWrongAnswers(wrongCount);
        attempt.setTotalQuestions(exam.getTotalQuestions());

        // Calculate score (simple percentage for now)
        double percentage = (correctCount * 100.0) / exam.getTotalQuestions();
        attempt.setPercentage(percentage);
        attempt.setScore(percentage); // Using percentage as score

        // Note: Individual answers will be stored in ExamAnswer entity in future implementation
        // Removed: attempt.setAnswers() - field doesn't exist, using ExamAnswer entity instead

        ExamAttempt savedAttempt = examAttemptRepository.save(attempt);

        // Prepare response
        Map<String, Object> result = new HashMap<>();
        result.put("id", savedAttempt.getId());
        result.put("score", savedAttempt.getScore());
        result.put("percentage", savedAttempt.getPercentage());
        result.put("correctAnswers", savedAttempt.getCorrectAnswers());
        result.put("wrongAnswers", savedAttempt.getWrongAnswers());
        result.put("totalQuestions", savedAttempt.getTotalQuestions());
        result.put("timeTaken", savedAttempt.getTimeTakenMinutes());
        result.put("attemptedAt", savedAttempt.getAttemptedAt());

        return ResponseEntity.ok(result);
    }
}

