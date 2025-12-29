package com.skillforge.service;

import com.skillforge.entity.*;
import com.skillforge.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private ExamAttemptRepository examAttemptRepository;

    @Autowired
    private ExamAnswerRepository examAnswerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    /**
     * Auto-evaluate exam answers and calculate score
     */
    @Transactional
    public ExamAttempt evaluateAndSaveAttempt(Exam exam, User student, Map<Long, String> answers, Integer timeTaken) {
        // Get all questions for the exam
        List<Question> questions = questionRepository.findByExam(exam);
        
        if (questions.isEmpty()) {
            throw new RuntimeException("No questions found for this exam");
        }

        // Create exam attempt
        ExamAttempt attempt = new ExamAttempt();
        attempt.setExam(exam);
        attempt.setStudent(student);
        attempt.setAttemptedAt(LocalDateTime.now());
        attempt.setTimeTakenMinutes(timeTaken);
        attempt.setTotalQuestions(questions.size());

        int correctCount = 0;
        int wrongCount = 0;
        double totalMarks = 0.0;
        double obtainedMarks = 0.0;

        // Save attempt first to get ID for exam answers
        ExamAttempt savedAttempt = examAttemptRepository.save(attempt);

        // Evaluate each answer
        for (Question question : questions) {
            totalMarks += question.getMarks();
            
            ExamAnswer examAnswer = new ExamAnswer();
            examAnswer.setExamAttempt(savedAttempt);
            examAnswer.setQuestion(question);
            
            String selectedOption = answers.get(question.getId());
            examAnswer.setSelectedOption(selectedOption);

            // Check if answer is correct
            boolean isCorrect = selectedOption != null && 
                               selectedOption.equalsIgnoreCase(question.getCorrectOption());
            examAnswer.setIsCorrect(isCorrect);

            // Calculate marks
            if (isCorrect) {
                correctCount++;
                examAnswer.setMarksObtained(question.getMarks());
                obtainedMarks += question.getMarks();
            } else {
                wrongCount++;
                // Apply negative marking if enabled
                if (exam.getNegativeMarking() && selectedOption != null) {
                    double negativeMark = exam.getNegativeMarkValue() * question.getMarks();
                    examAnswer.setMarksObtained(-negativeMark);
                    obtainedMarks -= negativeMark;
                } else {
                    examAnswer.setMarksObtained(0.0);
                }
            }

            examAnswerRepository.save(examAnswer);
        }

        // Update attempt with results
        savedAttempt.setCorrectAnswers(correctCount);
        savedAttempt.setWrongAnswers(wrongCount);
        savedAttempt.setScore(obtainedMarks);
        savedAttempt.setPercentage((obtainedMarks / totalMarks) * 100.0);

        return examAttemptRepository.save(savedAttempt);
    }

    /**
     * Verify if student is enrolled in the course
     */
    public boolean isStudentEnrolled(User student, Exam exam) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        return enrollments.stream()
                .anyMatch(e -> e.getCourse().getId().equals(exam.getCourse().getId()));
    }

    /**
     * Check if student can attempt the exam
     */
    public boolean canStudentAttemptExam(User student, Exam exam) {
        List<ExamAttempt> attempts = examAttemptRepository.findByStudentAndExam(student, exam);
        return attempts.size() < exam.getMaxAttempts();
    }

    /**
     * Get student's attempts for an exam
     */
    public List<ExamAttempt> getStudentAttempts(User student, Exam exam) {
        return examAttemptRepository.findByStudentAndExam(student, exam);
    }
}
