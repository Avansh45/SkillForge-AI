package com.skillforge.service;

import com.skillforge.entity.Assignment;
import com.skillforge.entity.AssignmentSubmission;
import com.skillforge.entity.User;
import com.skillforge.exception.ForbiddenAccessException;
import com.skillforge.exception.InvalidRequestException;
import com.skillforge.exception.ResourceNotFoundException;
import com.skillforge.repository.AssignmentRepository;
import com.skillforge.repository.AssignmentSubmissionRepository;
import com.skillforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class SubmissionService {

    private static final Logger logger = LoggerFactory.getLogger(SubmissionService.class);
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final String ALLOWED_FILE_TYPE = "application/pdf";

    @Autowired
    private AssignmentSubmissionRepository submissionRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssignmentService assignmentService;

    @Value("${app.assignments.upload-dir}")
    private String uploadDir;

    /**
     * Submit assignment (Student only)
     * Security: Requires STUDENT role + enrollment validation
     */
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public AssignmentSubmission submitAssignment(Long assignmentId, MultipartFile file, String studentEmail) throws IOException {
        logger.info("Submitting assignment ID: {} by student: {}", assignmentId, studentEmail);

        // Validate file
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("File is required");
        }

        // Validate file type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new InvalidRequestException("File name is required");
        }

        if (!ALLOWED_FILE_TYPE.equals(file.getContentType()) && 
            !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new InvalidRequestException("Only PDF files are allowed");
        }

        // Validate file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidRequestException("File size must not exceed 5MB");
        }

        // Get assignment
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        // Get student
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Verify user is a student
        if (!student.getRole().equals(User.Role.STUDENT)) {
            throw new ForbiddenAccessException("Only students can submit assignments");
        }

        // ACCESS CHECK: Verify student can access this assignment (must be enrolled)
        if (!assignmentService.canAccessAssignment(assignmentId, studentEmail)) {
            throw new ForbiddenAccessException("You must be enrolled in this course to submit assignments");
        }

        // Check if already submitted
        if (submissionRepository.existsByAssignmentAndStudent(assignment, student)) {
            throw new InvalidRequestException("You have already submitted this assignment. Only one submission is allowed per assignment.");
        }

        // Create directory for assignment submissions
        Path assignmentDirPath = Paths.get(uploadDir, assignmentId.toString());
        if (!Files.exists(assignmentDirPath)) {
            Files.createDirectories(assignmentDirPath);
            logger.info("Created directory: {}", assignmentDirPath);
        }

        // Generate unique filename
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = student.getId() + "_" + UUID.randomUUID().toString() + fileExtension;
        Path filePath = assignmentDirPath.resolve(fileName);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("File saved to: {}", filePath);

        // Create submission entity
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setFilePath(filePath.toString());
        submission.setFileSize(file.getSize());

        AssignmentSubmission savedSubmission = submissionRepository.save(submission);
        logger.info("Submission saved to database with ID: {}", savedSubmission.getId());

        return savedSubmission;
    }

    /**
     * Get all submissions for an assignment (Instructor/Admin only)
     * Security: Requires INSTRUCTOR or ADMIN role + ownership validation
     */
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public List<AssignmentSubmission> getSubmissionsByAssignment(Long assignmentId, String userEmail) {
        logger.info("Fetching submissions for assignment ID: {}, user: {}", assignmentId, userEmail);

        // Get assignment
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        // Get user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Verify instructor owns the assignment or is admin
        if (!user.getRole().equals(User.Role.ADMIN)) {
            if (!user.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can view submissions");
            }
            if (!assignment.getInstructor().getId().equals(user.getId())) {
                throw new ForbiddenAccessException("You can only view submissions for your own assignments");
            }
        }

        return submissionRepository.findByAssignmentOrderBySubmittedAtDesc(assignment);
    }

    /**
     * Get student's own submissions
     * Security: Requires STUDENT role
     */
    @PreAuthorize("hasRole('STUDENT')")
    public List<AssignmentSubmission> getSubmissionsByStudent(String studentEmail) {
        logger.info("Fetching submissions for student: {}", studentEmail);

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (!student.getRole().equals(User.Role.STUDENT)) {
            throw new ForbiddenAccessException("This endpoint is only for students");
        }

        return submissionRepository.findByStudentOrderBySubmittedAtDesc(student);
    }

    /**
     * Get student's submission for a specific assignment
     */
    public AssignmentSubmission getStudentSubmission(Long assignmentId, String studentEmail) {
        logger.info("Fetching submission for assignment ID: {}, student: {}", assignmentId, studentEmail);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return submissionRepository.findByAssignmentAndStudent(assignment, student)
                .orElse(null); // Return null if not submitted yet
    }

    /**
     * Grade a submission (Instructor/Admin only)
     * Security: Requires INSTRUCTOR or ADMIN role + ownership validation
     */
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @Transactional
    public AssignmentSubmission gradeSubmission(Long submissionId, Double marksAwarded, 
                                               String feedback, String instructorEmail) {
        logger.info("Grading submission ID: {}, instructor: {}", submissionId, instructorEmail);

        // Get submission
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + submissionId));

        // Get instructor
        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Verify instructor owns the assignment or is admin
        if (!instructor.getRole().equals(User.Role.ADMIN)) {
            if (!instructor.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can grade submissions");
            }
            if (!submission.getAssignment().getInstructor().getId().equals(instructor.getId())) {
                throw new ForbiddenAccessException("You can only grade submissions for your own assignments");
            }
        }

        // Validate marks
        if (marksAwarded != null) {
            if (marksAwarded < 0) {
                throw new InvalidRequestException("Marks cannot be negative");
            }
            if (marksAwarded > submission.getAssignment().getMaxMarks()) {
                throw new InvalidRequestException("Marks cannot exceed maximum marks for this assignment");
            }
            submission.setMarksAwarded(marksAwarded);
        }

        // Set feedback
        if (feedback != null) {
            submission.setFeedback(feedback.trim());
        }

        AssignmentSubmission gradedSubmission = submissionRepository.save(submission);
        logger.info("Submission graded: {}", gradedSubmission.getId());

        return gradedSubmission;
    }

    /**
     * Get submission by ID (with access control)
     */
    public AssignmentSubmission getSubmissionById(Long submissionId) {
        return submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with ID: " + submissionId));
    }

    /**
     * Check if user can access submission
     */
    public boolean canAccessSubmission(Long submissionId, String userEmail) {
        AssignmentSubmission submission = getSubmissionById(submissionId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Admin can access everything
        if (user.getRole().equals(User.Role.ADMIN)) {
            logger.info("Admin {} granted access to submission {}", userEmail, submissionId);
            return true;
        }

        // Instructor can access submissions for their assignments
        if (user.getRole().equals(User.Role.INSTRUCTOR)) {
            boolean hasAccess = submission.getAssignment().getInstructor().getId().equals(user.getId());
            logger.info("Instructor {} {} access to submission {}", userEmail, hasAccess ? "granted" : "denied", submissionId);
            return hasAccess;
        }

        // Student can access their own submissions
        if (user.getRole().equals(User.Role.STUDENT)) {
            boolean hasAccess = submission.getStudent().getId().equals(user.getId());
            logger.info("Student {} {} access to submission {}", userEmail, hasAccess ? "granted" : "denied", submissionId);
            return hasAccess;
        }

        logger.warn("User {} with role {} denied access to submission {}", userEmail, user.getRole(), submissionId);
        return false;
    }

    /**
     * Delete a submission (Admin only, or instructor can delete before grading)
     * Security: Requires ADMIN role
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public void deleteSubmission(Long submissionId, String userEmail) {
        logger.info("Deleting submission ID: {}, user: {}", submissionId, userEmail);

        AssignmentSubmission submission = getSubmissionById(submissionId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK
        if (!user.getRole().equals(User.Role.ADMIN)) {
            throw new ForbiddenAccessException("Only admins can delete submissions");
        }

        // Delete physical file
        try {
            Path filePath = Paths.get(submission.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Physical file deleted: {}", filePath);
            }
        } catch (IOException e) {
            logger.error("Error deleting physical file: {}", e.getMessage());
        }

        // Delete from database
        submissionRepository.delete(submission);
        logger.info("Submission deleted from database");
    }

    /**
     * Get all submissions (Admin only)
     */
    public List<AssignmentSubmission> getAllSubmissions() {
        logger.info("Fetching all submissions for admin");
        return submissionRepository.findAll();
    }

    /**
     * Get pending grading submissions for an assignment
     */
    public List<AssignmentSubmission> getPendingGradingByAssignment(Long assignmentId, String instructorEmail) {
        logger.info("Fetching pending grading for assignment ID: {}, instructor: {}", assignmentId, instructorEmail);

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with ID: " + assignmentId));

        User instructor = userRepository.findByEmail(instructorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK
        if (!instructor.getRole().equals(User.Role.ADMIN)) {
            if (!instructor.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can view pending grading");
            }
            if (!assignment.getInstructor().getId().equals(instructor.getId())) {
                throw new ForbiddenAccessException("You can only view pending grading for your own assignments");
            }
        }

        return submissionRepository.findPendingGradingByAssignment(assignmentId);
    }
}
