package com.skillforge.repository;

import com.skillforge.entity.Assignment;
import com.skillforge.entity.AssignmentSubmission;
import com.skillforge.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    
    /**
     * Find submission by assignment and student (unique constraint)
     */
    Optional<AssignmentSubmission> findByAssignmentAndStudent(Assignment assignment, User student);
    
    /**
     * Check if a student has already submitted for an assignment
     */
    boolean existsByAssignmentAndStudent(Assignment assignment, User student);
    
    /**
     * Find all submissions for a specific assignment
     */
    List<AssignmentSubmission> findByAssignmentOrderBySubmittedAtDesc(Assignment assignment);
    
    /**
     * Find all submissions by a specific student
     */
    List<AssignmentSubmission> findByStudentOrderBySubmittedAtDesc(User student);
    
    /**
     * Find submissions by assignment ID
     */
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignment.id = :assignmentId ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByAssignmentId(@Param("assignmentId") Long assignmentId);
    
    /**
     * Find submissions by student ID
     */
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.student.id = :studentId ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByStudentId(@Param("studentId") Long studentId);
    
    /**
     * Find submissions that haven't been graded yet (marks_awarded is null)
     */
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.marksAwarded IS NULL ORDER BY s.submittedAt ASC")
    List<AssignmentSubmission> findPendingGrading();
    
    /**
     * Find ungraded submissions for a specific assignment
     */
    @Query("SELECT s FROM AssignmentSubmission s WHERE s.assignment.id = :assignmentId AND s.marksAwarded IS NULL ORDER BY s.submittedAt ASC")
    List<AssignmentSubmission> findPendingGradingByAssignment(@Param("assignmentId") Long assignmentId);
    
    /**
     * Count submissions for an assignment
     */
    Long countByAssignment(Assignment assignment);
    
    /**
     * Count graded submissions for an assignment
     */
    @Query("SELECT COUNT(s) FROM AssignmentSubmission s WHERE s.assignment.id = :assignmentId AND s.marksAwarded IS NOT NULL")
    Long countGradedSubmissionsByAssignment(@Param("assignmentId") Long assignmentId);
    
    /**
     * Get submissions for assignments in a specific course
     */
    @Query("SELECT s FROM AssignmentSubmission s " +
           "WHERE s.assignment.course.id = :courseId " +
           "ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByCourseId(@Param("courseId") Long courseId);
    
    /**
     * Get student's submissions for a specific course
     */
    @Query("SELECT s FROM AssignmentSubmission s " +
           "WHERE s.student.id = :studentId " +
           "AND s.assignment.course.id = :courseId " +
           "ORDER BY s.submittedAt DESC")
    List<AssignmentSubmission> findByStudentIdAndCourseId(
        @Param("studentId") Long studentId, 
        @Param("courseId") Long courseId
    );
}
