package com.skillforge.repository;

import com.skillforge.entity.Exam;
import com.skillforge.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByExamOrderByQuestionOrderAsc(Exam exam);
    List<Question> findByExam(Exam exam);
    Long countByExam(Exam exam);
}
