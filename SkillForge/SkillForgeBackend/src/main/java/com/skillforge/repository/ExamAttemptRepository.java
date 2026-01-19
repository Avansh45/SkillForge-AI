package com.skillforge.repository;

import com.skillforge.entity.ExamAttempt;
import com.skillforge.entity.User;
import com.skillforge.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    List<ExamAttempt> findByStudent(User student);
    List<ExamAttempt> findByExam(Exam exam);
    List<ExamAttempt> findByStudentOrderByAttemptedAtDesc(User student);
<<<<<<< HEAD
=======
    List<ExamAttempt> findByStudentAndExam(User student, Exam exam);
>>>>>>> TempBranch
}

