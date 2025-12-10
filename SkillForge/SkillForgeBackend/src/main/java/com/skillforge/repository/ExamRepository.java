package com.skillforge.repository;

import com.skillforge.entity.Exam;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCourse(Course course);
    List<Exam> findByInstructor(User instructor);
    List<Exam> findByStartTimeAfter(LocalDateTime dateTime);
}

