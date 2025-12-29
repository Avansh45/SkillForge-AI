package com.skillforge.controller;

import com.skillforge.entity.*;
import com.skillforge.repository.*;
import com.skillforge.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exam-submissions")
@CrossOrigin(origins = "*")
public class ExamSubmissionController {

    @Autowired
    private ExamService examService;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamAnswerRepository examAnswerRepository;

    /**
     * Student starts an exam - fetches questions without correct answers
     */
    @GetMapping("/start/{examId}")
    public ResponseEntity<Map<String, Object>> startExam(
            @PathVariable Long examId,
            Authentication authentication) {

        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Verify student is enrolled
        if (!examService.isStudentEnrolled(student, exam)) {
            throw new RuntimeException("You are not enrolled in this course");
        }

        // Check if student can attempt
        if (!examService.canStudentAttemptExam(student, exam)) {
            throw new RuntimeException("Maximum attempts reached for this exam");
        }

        // Get questions (without correct answers)
        List<Question> questions = questionRepository.findByExamOrderByQuestionOrderAsc(exam);

        List<Map<String, Object>> questionList = questions.stream().map(q -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", q.getId());
            data.put("questionText", q.getQuestionText());
            data.put("optionA", q.getOptionA());
            data.put("optionB", q.getOptionB());
            data.put("optionC", q.getOptionC());
            data.put("optionD", q.getOptionD());
            data.put("marks", q.getMarks());
            data.put("questionOrder", q.getQuestionOrder());
            // NO correctOption
            return data;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("examId", exam.getId());
        response.put("title", exam.getTitle());
        response.put("description", exam.getDescription());
        response.put("durationMinutes", exam.getDurationMinutes());
        response.put("totalQuestions", questions.size());
        response.put("negativeMarking", exam.getNegativeMarking());
        response.put("negativeMarkValue", exam.getNegativeMarkValue());
        response.put("questions", questionList);

        return ResponseEntity.ok(response);
    }

    /**
     * Student submits exam - auto-evaluates and saves results
     */
    @PostMapping("/submit/{examId}")
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
        if (!examService.isStudentEnrolled(student, exam)) {
            throw new RuntimeException("You are not enrolled in this course");
        }

        // Check if student can attempt
        if (!examService.canStudentAttemptExam(student, exam)) {
            throw new RuntimeException("Maximum attempts reached for this exam");
        }

        // Parse answers: { "questionId": "selectedOption", ... }
        @SuppressWarnings("unchecked")
        Map<String, String> answersRaw = (Map<String, String>) submissionData.get("answers");
        Map<Long, String> answers = new HashMap<>();
        if (answersRaw != null) {
            for (Map.Entry<String, String> entry : answersRaw.entrySet()) {
                answers.put(Long.valueOf(entry.getKey()), entry.getValue());
            }
        }

        Integer timeTaken = submissionData.get("timeTakenMinutes") != null 
            ? Integer.valueOf(submissionData.get("timeTakenMinutes").toString())
            : exam.getDurationMinutes();

        // Auto-evaluate and save
        ExamAttempt savedAttempt = examService.evaluateAndSaveAttempt(exam, student, answers, timeTaken);

        // Prepare response
        Map<String, Object> result = new HashMap<>();
        result.put("attemptId", savedAttempt.getId());
        result.put("score", savedAttempt.getScore());
        result.put("percentage", savedAttempt.getPercentage());
        result.put("correctAnswers", savedAttempt.getCorrectAnswers());
        result.put("wrongAnswers", savedAttempt.getWrongAnswers());
        result.put("totalQuestions", savedAttempt.getTotalQuestions());
        result.put("timeTaken", savedAttempt.getTimeTakenMinutes());
        result.put("attemptedAt", savedAttempt.getAttemptedAt());

        return ResponseEntity.ok(result);
    }

    /**
     * Get detailed results for a specific attempt (Student view)
     */
    @GetMapping("/results/{attemptId}")
    public ResponseEntity<Map<String, Object>> getAttemptResults(
            @PathVariable Long attemptId,
            Authentication authentication) {

        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        ExamAttempt attempt = examRepository.findById(attemptId)
                .map(exam -> exam.getAttempts().stream()
                        .filter(a -> a.getId().equals(attemptId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Attempt not found")))
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        // Verify student owns this attempt
        if (!attempt.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("You can only view your own attempts");
        }

        // Get all answers for this attempt
        List<ExamAnswer> examAnswers = examAnswerRepository.findByExamAttempt(attempt);

        List<Map<String, Object>> answerDetails = examAnswers.stream().map(ea -> {
            Map<String, Object> data = new HashMap<>();
            data.put("questionId", ea.getQuestion().getId());
            data.put("questionText", ea.getQuestion().getQuestionText());
            data.put("selectedOption", ea.getSelectedOption());
            data.put("correctOption", ea.getQuestion().getCorrectOption());
            data.put("isCorrect", ea.getIsCorrect());
            data.put("marksObtained", ea.getMarksObtained());
            data.put("totalMarks", ea.getQuestion().getMarks());
            
            Map<String, String> options = new HashMap<>();
            options.put("A", ea.getQuestion().getOptionA());
            options.put("B", ea.getQuestion().getOptionB());
            options.put("C", ea.getQuestion().getOptionC());
            options.put("D", ea.getQuestion().getOptionD());
            data.put("options", options);
            
            return data;
        }).collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("attemptId", attempt.getId());
        response.put("examTitle", attempt.getExam().getTitle());
        response.put("score", attempt.getScore());
        response.put("percentage", attempt.getPercentage());
        response.put("correctAnswers", attempt.getCorrectAnswers());
        response.put("wrongAnswers", attempt.getWrongAnswers());
        response.put("totalQuestions", attempt.getTotalQuestions());
        response.put("timeTaken", attempt.getTimeTakenMinutes());
        response.put("attemptedAt", attempt.getAttemptedAt());
        response.put("answers", answerDetails);

        return ResponseEntity.ok(response);
    }
}
