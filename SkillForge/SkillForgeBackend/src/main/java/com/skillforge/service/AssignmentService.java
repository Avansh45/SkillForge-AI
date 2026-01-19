package com.skillforge.service;

import com.skillforge.entity.Assignment;
import com.skillforge.entity.Course;
import com.skillforge.entity.User;
import com.skillforge.exception.ForbiddenAccessException;
import com.skillforge.exception.InvalidRequestException;
import com.skillforge.exception.ResourceNotFoundException;
import com.skillforge.repository.AssignmentRepository;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    private static final Logger logger = LoggerFactory.getLogger(AssignmentService.class);

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    /**
     * Create a new assignment for a course (Instructor/Admin only)
     * Security: Requires INSTRUCTOR or ADMIN role + ownership validation
     */
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Transactional
    public Assignment createAssignment(Long courseId, String title, String description, 
                                      LocalDateTime dueDate, Double maxMarks, String instructorEmail) {
        logger.info("Creating assignment for course ID: {}, instructor: {}", courseId, instructorEmail);

        // Validate input
        if (title == null || title.trim().isEmpty()) {
            throw new InvalidRequestException("Assignment title is required");
        }
        if (maxMarks == null || maxMarks <= 0) {
            throw new InvalidRequestException("Max marks must be greater than 0");
        }

        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        // Get instructor
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Verify instructor owns the course or is admin
        if (!instructor.getRole().equals(User.Role.ADMIN)) {
            if (!instructor.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can create assignments");
            }
            if (!course.getInstructor().getId().equals(instructor.getId())) {
                throw new ForbiddenAccessException("You can only create assignments for your own courses");
            }
        }

        // Create assignment
        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setInstructor(instructor);
        assignment.setTitle(title.trim());
        assignment.setDescription(description != null ? description.trim() : null);
        assignment.setDueDate(dueDate);
        assignment.setMaxMarks(maxMarks);

        Assignment savedAssignment = assignmentRepository.save(assignment);
        logger.info("Assignment created with ID: {}", savedAssignment.getId());

        return savedAssignment;
    }

    /**
     * Update an existing assignment (Instructor/Admin only)
     * Security: Requires INSTRUCTOR or ADMIN role + ownership validation
     */
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Transactional
    public Assignment updateAssignment(Long assignmentId, String title, String description,
                                      LocalDateTime dueDate, Double maxMarks, String instructorEmail) {
        logger.info("Updating assignment ID: {}, instructor: {}", assignmentId, instructorEmail);

        // Get assignment
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        // Get user
        User user = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Verify instructor owns the assignment or is admin
        if (!user.getRole().equals(User.Role.ADMIN)) {
            if (!user.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can update assignments");
            }
            if (!assignment.getInstructor().getId().equals(user.getId())) {
                throw new ForbiddenAccessException("You can only update your own assignments");
            }
        }

        // Update fields
        if (title != null && !title.trim().isEmpty()) {
            assignment.setTitle(title.trim());
        }
        if (description != null) {
            assignment.setDescription(description.trim());
        }
        if (dueDate != null) {
            assignment.setDueDate(dueDate);
        }
        if (maxMarks != null && maxMarks > 0) {
            assignment.setMaxMarks(maxMarks);
        }

        Assignment updatedAssignment = assignmentRepository.save(assignment);
        logger.info("Assignment updated: {}", updatedAssignment.getId());

        return updatedAssignment;
    }

    /**
     * Delete an assignment (Instructor/Admin only)
     * Security: Requires INSTRUCTOR or ADMIN role + ownership validation
     */
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Transactional
    public void deleteAssignment(Long assignmentId, String userEmail) {
        logger.info("Deleting assignment ID: {}, user: {}", assignmentId, userEmail);

        // Get assignment
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        // Get user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Verify instructor owns the assignment or is admin
        if (!user.getRole().equals(User.Role.ADMIN)) {
            if (!user.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can delete assignments");
            }
            if (!assignment.getInstructor().getId().equals(user.getId())) {
                throw new ForbiddenAccessException("You can only delete your own assignments");
            }
        }

        // Delete assignment (submissions will be cascade deleted)
        assignmentRepository.delete(assignment);
        logger.info("Assignment deleted: {}", assignmentId);
    }

    /**
     * Get all assignments for a course (Instructor/Admin)
     * Security: Requires INSTRUCTOR or ADMIN role + ownership validation
     */
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<Assignment> getAssignmentsByCourse(Long courseId, String userEmail) {
        logger.info("Fetching assignments for course ID: {}, user: {}", courseId, userEmail);

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        // Get user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Verify instructor owns the course or is admin
        if (!user.getRole().equals(User.Role.ADMIN)) {
            if (!user.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can view all assignments");
            }
            if (!course.getInstructor().getId().equals(user.getId())) {
                throw new ForbiddenAccessException("You can only view assignments for your own courses");
            }
        }

        return assignmentRepository.findByCourseOrderByDueDateDesc(course);
    }

    /**
     * Get assignments for a course that a student is enrolled in
     * Security: Requires STUDENT role + enrollment validation
     */
    @PreAuthorize("hasRole('STUDENT')")
    public List<Assignment> getAssignmentsForStudent(Long courseId, String studentEmail) {
        logger.info("Fetching assignments for student: {} in course ID: {}", studentEmail, courseId);

        // Get student
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Verify user is a student
        if (!student.getRole().equals(User.Role.STUDENT)) {
            throw new ForbiddenAccessException("This endpoint is only for students");
        }

        // Verify course exists
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        // ENROLLMENT CHECK: Verify student is enrolled in the course
        boolean isEnrolled = enrollmentRepository.findByStudentAndCourse(student, course).isPresent();
        if (!isEnrolled) {
            throw new ForbiddenAccessException("You must be enrolled in this course to view its assignments");
        }

        return assignmentRepository.findByCourseOrderByDueDateDesc(course);
    }

    /**
     * Get assignment by ID (with access control)
     */
    public Assignment getAssignmentById(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));
    }

    /**
     * Check if user can access assignment
     */
    public boolean canAccessAssignment(Long assignmentId, String userEmail) {
        Assignment assignment = getAssignmentById(assignmentId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Admin can access everything
        if (user.getRole().equals(User.Role.ADMIN)) {
            return true;
        }

        // Instructor can access their own course assignments
        if (user.getRole().equals(User.Role.INSTRUCTOR)) {
            return assignment.getCourse().getInstructor().getId().equals(user.getId());
        }

        // Student can access if enrolled
        if (user.getRole().equals(User.Role.STUDENT)) {
            return enrollmentRepository.findByStudentAndCourse(user, assignment.getCourse()).isPresent();
        }

        return false;
    }

    /**
     * Get all assignments (Admin only)
     */
    public List<Assignment> getAllAssignments() {
        logger.info("Fetching all assignments for admin");
        return assignmentRepository.findAll();
    }

    /**
     * Get assignments created by instructor
     */
    public List<Assignment> getAssignmentsByInstructor(String instructorEmail) {
        logger.info("Fetching assignments for instructor: {}", instructorEmail);

        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        if (!instructor.getRole().equals(User.Role.INSTRUCTOR) && !instructor.getRole().equals(User.Role.ADMIN)) {
            throw new ForbiddenAccessException("Only instructors can access this endpoint");
        }

        return assignmentRepository.findByInstructorOrderByCreatedAtDesc(instructor);
    }
}
