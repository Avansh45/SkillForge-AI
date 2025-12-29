package com.skillforge.controller;

import com.skillforge.entity.Exam;
import com.skillforge.entity.Question;
import com.skillforge.entity.User;
import com.skillforge.repository.ExamRepository;
import com.skillforge.repository.QuestionRepository;
import com.skillforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a new question for an exam (Instructor only)
     */
    @PostMapping("/exam/{examId}")
    public ResponseEntity<Map<String, Object>> createQuestion(
            @PathVariable Long examId,
            @RequestBody Map<String, Object> questionData,
            Authentication authentication) {

        System.out.println("=== CREATE QUESTION DEBUG ===");
        System.out.println("Exam ID: " + examId);
        System.out.println("Authentication object: " + authentication);
        System.out.println("Authentication name: " + authentication.getName());
        System.out.println("Authentication authorities: " + authentication.getAuthorities());
        System.out.println("Is authenticated: " + authentication.isAuthenticated());
        System.out.println("============================");

        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        System.out.println("Found instructor: " + instructor.getEmail() + " with role: " + instructor.getRole());

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        System.out.println("Found exam: " + exam.getTitle() + " created by: " + exam.getInstructor().getEmail());

        // Verify instructor owns the exam
        if (!exam.getInstructor().getId().equals(instructor.getId())) {
            System.out.println("=== OWNERSHIP ERROR ===");
            System.out.println("Exam ID: " + examId);
            System.out.println("Exam creator: " + exam.getInstructor().getEmail() + " (ID: " + exam.getInstructor().getId() + ")");
            System.out.println("Current user: " + email + " (ID: " + instructor.getId() + ")");
            System.out.println("======================");
            throw new RuntimeException("You can only add questions to your own exams. This exam belongs to " + exam.getInstructor().getEmail());
        }

        // Create question
        Question question = new Question();
        question.setExam(exam);
        question.setQuestionText((String) questionData.get("questionText"));
        question.setOptionA((String) questionData.get("optionA"));
        question.setOptionB((String) questionData.get("optionB"));
        question.setOptionC((String) questionData.get("optionC"));
        question.setOptionD((String) questionData.get("optionD"));
        question.setCorrectOption((String) questionData.get("correctOption"));
        
        if (questionData.get("marks") != null) {
            question.setMarks(Double.valueOf(questionData.get("marks").toString()));
        }
        if (questionData.get("questionOrder") != null) {
            question.setQuestionOrder(Integer.valueOf(questionData.get("questionOrder").toString()));
        }

        Question savedQuestion = questionRepository.save(question);

        // Prepare response
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedQuestion.getId());
        response.put("questionText", savedQuestion.getQuestionText());
        response.put("optionA", savedQuestion.getOptionA());
        response.put("optionB", savedQuestion.getOptionB());
        response.put("optionC", savedQuestion.getOptionC());
        response.put("optionD", savedQuestion.getOptionD());
        response.put("correctOption", savedQuestion.getCorrectOption());
        response.put("questionType", savedQuestion.getQuestionType());
        response.put("marks", savedQuestion.getMarks());
        response.put("questionOrder", savedQuestion.getQuestionOrder());
        response.put("createdAt", savedQuestion.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * Get all questions for an exam (Instructor only - includes correct answers)
     */
    @GetMapping("/exam/{examId}/instructor")
    public ResponseEntity<List<Map<String, Object>>> getExamQuestionsForInstructor(
            @PathVariable Long examId,
            Authentication authentication) {

        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        // Verify instructor owns the exam
        if (!exam.getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("You can only view questions for your own exams");
        }

        List<Question> questions = questionRepository.findByExamOrderByQuestionOrderAsc(exam);

        List<Map<String, Object>> questionList = questions.stream().map(q -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", q.getId());
            data.put("questionText", q.getQuestionText());
            data.put("optionA", q.getOptionA());
            data.put("optionB", q.getOptionB());
            data.put("optionC", q.getOptionC());
            data.put("optionD", q.getOptionD());
            data.put("correctOption", q.getCorrectOption()); // Include correct answer
            data.put("questionType", q.getQuestionType());
            data.put("marks", q.getMarks());
            data.put("questionOrder", q.getQuestionOrder());
            data.put("createdAt", q.getCreatedAt());
            return data;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(questionList);
    }

    /**
     * Get questions for an exam (Student view - excludes correct answers)
     */
    @GetMapping("/exam/{examId}/student")
    public ResponseEntity<List<Map<String, Object>>> getExamQuestionsForStudent(
            @PathVariable Long examId,
            Authentication authentication) {

        String email = authentication.getName();
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<Question> questions = questionRepository.findByExamOrderByQuestionOrderAsc(exam);

        List<Map<String, Object>> questionList = questions.stream().map(q -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", q.getId());
            data.put("questionText", q.getQuestionText());
            data.put("optionA", q.getOptionA());
            data.put("optionB", q.getOptionB());
            data.put("optionC", q.getOptionC());
            data.put("optionD", q.getOptionD());
            // Do NOT include correctOption for students
            data.put("questionType", q.getQuestionType());
            data.put("marks", q.getMarks());
            data.put("questionOrder", q.getQuestionOrder());
            return data;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(questionList);
    }

    /**
     * Update a question (Instructor only)
     */
    @PutMapping("/{questionId}")
    public ResponseEntity<Map<String, Object>> updateQuestion(
            @PathVariable Long questionId,
            @RequestBody Map<String, Object> questionData,
            Authentication authentication) {

        System.out.println("=== UPDATE QUESTION DEBUG ===");
        System.out.println("Question ID: " + questionId);
        System.out.println("Authentication: " + authentication.getName());
        System.out.println("Authorities: " + authentication.getAuthorities());
        System.out.println("============================");

        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        System.out.println("Found question belonging to exam created by: " + question.getExam().getInstructor().getEmail());

        // Verify instructor owns the exam
        if (!question.getExam().getInstructor().getId().equals(instructor.getId())) {
            System.out.println("OWNERSHIP MISMATCH: Current user " + email + " vs Exam owner " + question.getExam().getInstructor().getEmail());
            throw new RuntimeException("You can only update questions for your own exams");
        }

        // Update fields
        if (questionData.containsKey("questionText")) {
            question.setQuestionText((String) questionData.get("questionText"));
        }
        if (questionData.containsKey("optionA")) {
            question.setOptionA((String) questionData.get("optionA"));
        }
        if (questionData.containsKey("optionB")) {
            question.setOptionB((String) questionData.get("optionB"));
        }
        if (questionData.containsKey("optionC")) {
            question.setOptionC((String) questionData.get("optionC"));
        }
        if (questionData.containsKey("optionD")) {
            question.setOptionD((String) questionData.get("optionD"));
        }
        if (questionData.containsKey("correctOption")) {
            question.setCorrectOption((String) questionData.get("correctOption"));
        }
        if (questionData.containsKey("questionType")) {
            question.setQuestionType((String) questionData.get("questionType"));
        }
        if (questionData.containsKey("marks") && questionData.get("marks") != null) {
            question.setMarks(Double.valueOf(questionData.get("marks").toString()));
        }
        if (questionData.containsKey("questionOrder") && questionData.get("questionOrder") != null) {
            question.setQuestionOrder(Integer.valueOf(questionData.get("questionOrder").toString()));
        }

        Question updatedQuestion = questionRepository.save(question);

        Map<String, Object> response = new HashMap<>();
        response.put("id", updatedQuestion.getId());
        response.put("questionText", updatedQuestion.getQuestionText());
        response.put("optionA", updatedQuestion.getOptionA());
        response.put("optionB", updatedQuestion.getOptionB());
        response.put("optionC", updatedQuestion.getOptionC());
        response.put("optionD", updatedQuestion.getOptionD());
        response.put("correctOption", updatedQuestion.getCorrectOption());
        response.put("questionType", updatedQuestion.getQuestionType());
        response.put("marks", updatedQuestion.getMarks());
        response.put("questionOrder", updatedQuestion.getQuestionOrder());
        response.put("createdAt", updatedQuestion.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * Delete a question (Instructor only)
     */
    @DeleteMapping("/{questionId}")
    public ResponseEntity<Map<String, String>> deleteQuestion(
            @PathVariable Long questionId,
            Authentication authentication) {

        String email = authentication.getName();
        User instructor = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Instructor not found"));

        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));

        // Verify instructor owns the exam
        if (!question.getExam().getInstructor().getId().equals(instructor.getId())) {
            throw new RuntimeException("You can only delete questions from your own exams");
        }

        questionRepository.delete(question);

        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }
}
