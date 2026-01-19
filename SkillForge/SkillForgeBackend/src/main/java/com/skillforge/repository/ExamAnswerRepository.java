package com.skillforge.repository;

import com.skillforge.entity.ExamAnswer;
import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {
    List<ExamAnswer> findByExamAttempt(ExamAttempt examAttempt);
    Optional<ExamAnswer> findByExamAttemptAndQuestion(ExamAttempt examAttempt, Question question);
    Long countByExamAttemptAndIsCorrect(ExamAttempt examAttempt, Boolean isCorrect);
}
