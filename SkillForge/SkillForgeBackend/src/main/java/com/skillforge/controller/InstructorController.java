package com.skillforge.controller;

import com.skillforge.entity.Batch;
import com.skillforge.entity.Course;
import com.skillforge.entity.Exam;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.User;
import com.skillforge.repository.BatchRepository;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.ExamAttemptRepository;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

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

    @GetMapping("/exams")
    public ResponseEntity<List<Map<String, Object>>> getMyExams(Authentication authentication) {
        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        List<Exam> exams = examRepository.findByInstructor(instructor);
        
        List<Map<String, Object>> examList = exams.stream().map(exam -> {
            Map<String, Object> examData = new HashMap<>();
            examData.put("id", exam.getId());
            examData.put("title", exam.getTitle());
            examData.put("description", exam.getDescription());
            examData.put("startTime", exam.getStartTime());
            examData.put("endTime", exam.getEndTime());
            examData.put("durationMinutes", exam.getDurationMinutes());
            examData.put("totalQuestions", exam.getTotalQuestions());
            examData.put("maxAttempts", exam.getMaxAttempts());
            examData.put("attemptsCount", exam.getAttempts() != null ? exam.getAttempts().size() : 0);
            
            // Include course info
            if (exam.getCourse() != null) {
                Map<String, Object> courseInfo = new HashMap<>();
                courseInfo.put("id", exam.getCourse().getId());
                courseInfo.put("title", exam.getCourse().getTitle());
                examData.put("course", courseInfo);
            }
            
            return examData;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(examList);
    }

    @PostMapping("/exams")
    public ResponseEntity<Map<String, Object>> createExam(@RequestBody Map<String, Object> examData, Authentication authentication) {
        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        // Get course
        Long courseId = Long.valueOf(examData.get("courseId").toString());
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        // Verify instructor owns the course
        if (!course.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("You can only create exams for your own courses");
        }

        // Create exam
        Exam exam = new Exam();
        exam.setTitle((String) examData.get("title"));
        exam.setDescription((String) examData.get("description"));
        exam.setCourse(course);
        exam.setInstructor(instructor);
        
        if (examData.get("startTime") != null) {
            exam.setStartTime(java.time.LocalDateTime.parse((String) examData.get("startTime")));
        }
        if (examData.get("endTime") != null) {
            exam.setEndTime(java.time.LocalDateTime.parse((String) examData.get("endTime")));
        }
        if (examData.get("durationMinutes") != null) {
            exam.setDurationMinutes(Integer.valueOf(examData.get("durationMinutes").toString()));
        }
        if (examData.get("totalQuestions") != null) {
            exam.setTotalQuestions(Integer.valueOf(examData.get("totalQuestions").toString()));
        }
        if (examData.get("maxAttempts") != null) {
            exam.setMaxAttempts(Integer.valueOf(examData.get("maxAttempts").toString()));
        }
        if (examData.get("negativeMarking") != null) {
            exam.setNegativeMarking(Boolean.valueOf(examData.get("negativeMarking").toString()));
        }
        if (examData.get("negativeMarkValue") != null) {
            exam.setNegativeMarkValue(Double.valueOf(examData.get("negativeMarkValue").toString()));
        }

        Exam savedExam = examRepository.save(exam);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedExam.getId());
        response.put("title", savedExam.getTitle());
        response.put("description", savedExam.getDescription());
        response.put("startTime", savedExam.getStartTime());
        response.put("endTime", savedExam.getEndTime());
        response.put("durationMinutes", savedExam.getDurationMinutes());
        response.put("totalQuestions", savedExam.getTotalQuestions());
        response.put("maxAttempts", savedExam.getMaxAttempts());
        response.put("negativeMarking", savedExam.getNegativeMarking());
        response.put("negativeMarkValue", savedExam.getNegativeMarkValue());
        response.put("attemptsCount", 0);
        
        Map<String, Object> courseInfo = new HashMap<>();
        courseInfo.put("id", course.getId());
        courseInfo.put("title", course.getTitle());
        response.put("course", courseInfo);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/exams/{examId}/attempts")
    public ResponseEntity<List<Map<String, Object>>> getExamAttempts(
            @PathVariable Long examId,
            Authentication authentication) {
        
        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Verify the exam belongs to this instructor
        if (!exam.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("You do not have permission to view these attempts");
        }

        // Get all attempts for this exam
        List<ExamAttempt> attempts = examAttemptRepository.findByExam(exam);

        // Format response with student details
        List<Map<String, Object>> attemptData = attempts.stream()
                .map(attempt -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", attempt.getId());
                    data.put("score", attempt.getScore());
                    data.put("percentage", attempt.getPercentage());
                    data.put("correctAnswers", attempt.getCorrectAnswers());
                    data.put("wrongAnswers", attempt.getWrongAnswers());
                    data.put("totalQuestions", attempt.getTotalQuestions());
                    data.put("timeTakenMinutes", attempt.getTimeTakenMinutes());
                    data.put("attemptedAt", attempt.getAttemptedAt());

                    // Student info
                    User student = attempt.getStudent();
                    data.put("student", Map.of(
                            "id", student.getId(),
                            "name", student.getName(),
                            "email", student.getEmail()
                    ));

                    return data;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(attemptData);
    }

    @DeleteMapping("/exams/{examId}")
    public ResponseEntity<Map<String, String>> deleteExam(
            @PathVariable Long examId,
            Authentication authentication) {
        
        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        if (!exam.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("You do not have permission to delete this exam");
        }

        examRepository.delete(exam);
        return ResponseEntity.ok(Map.of("message", "Exam deleted successfully"));
    }
}

