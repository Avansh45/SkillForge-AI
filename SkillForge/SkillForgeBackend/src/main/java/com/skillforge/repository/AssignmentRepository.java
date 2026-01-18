package com.skillforge.repository;

import com.skillforge.entity.Assignment;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    /**
     * Find all assignments for a specific course
     */
    List<Assignment> findByCourseOrderByDueDateDesc(Course course);
    
    /**
     * Find all assignments created by a specific instructor
     */
    List<Assignment> findByInstructorOrderByCreatedAtDesc(User instructor);
    
    /**
     * Find assignments by course ID
     */
    @Query("SELECT a FROM Assignment a WHERE a.course.id = :courseId ORDER BY a.dueDate DESC")
    List<Assignment> findByCourseId(@Param("courseId") Long courseId);
    
    /**
     * Find assignments by instructor ID
     */
    @Query("SELECT a FROM Assignment a WHERE a.instructor.id = :instructorId ORDER BY a.createdAt DESC")
    List<Assignment> findByInstructorId(@Param("instructorId") Long instructorId);
    
    /**
     * Find assignments due after a specific date
     */
    List<Assignment> findByDueDateAfterOrderByDueDateAsc(LocalDateTime date);
    
    /**
     * Find assignments due before a specific date
     */
    List<Assignment> findByDueDateBeforeOrderByDueDateDesc(LocalDateTime date);
    
    /**
     * Find all assignments for courses where a student is enrolled
     */
    @Query("SELECT DISTINCT a FROM Assignment a " +
           "JOIN a.course c " +
           "JOIN Enrollment e ON e.course = c " +
           "WHERE e.student.id = :studentId " +
           "ORDER BY a.dueDate DESC")
    List<Assignment> findAssignmentsForEnrolledStudent(@Param("studentId") Long studentId);
    
    /**
     * Count assignments by course
     */
    Long countByCourse(Course course);
    
    /**
     * Count assignments by instructor
     */
    Long countByInstructor(User instructor);
}
