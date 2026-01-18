package com.skillforge.service;

import com.skillforge.entity.Course;
import com.skillforge.entity.CourseResource;
import com.skillforge.entity.Enrollment;
import com.skillforge.entity.User;
import com.skillforge.exception.ForbiddenAccessException;
import com.skillforge.exception.InvalidRequestException;
import com.skillforge.exception.ResourceNotFoundException;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.CourseResourceRepository;
import com.skillforge.repository.EnrollmentRepository;
import com.skillforge.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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
public class CourseResourceService {

    private static final Logger logger = LoggerFactory.getLogger(CourseResourceService.class);
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final String ALLOWED_FILE_TYPE = "application/pdf";

    @Autowired
    private CourseResourceRepository courseResourceRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Value("${app.resources.upload-dir}")
    private String uploadDir;

    @Transactional
    public CourseResource uploadResource(Long courseId, String title, MultipartFile file, String uploaderEmail) throws IOException {
        logger.info("Uploading resource for course ID: {}, uploader: {}", courseId, uploaderEmail);

        // Validate input parameters
        if (title == null || title.trim().isEmpty()) {
            throw new InvalidRequestException("Resource title is required");
        }

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
            throw new InvalidRequestException("File size must not exceed 10MB");
        }

        // Get course
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        // Get uploader
        User uploader = userRepository.findByEmail(uploaderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Verify instructor owns the course or is admin
        if (!uploader.getRole().equals(User.Role.ADMIN)) {
            if (!uploader.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can upload resources");
            }
            if (!course.getInstructor().getId().equals(uploader.getId())) {
                throw new ForbiddenAccessException("You can only upload resources to your own courses");
            }
        }

        // Create directory for course resources
        Path courseDirPath = Paths.get(uploadDir, courseId.toString());
        if (!Files.exists(courseDirPath)) {
            Files.createDirectories(courseDirPath);
            logger.info("Created directory: {}", courseDirPath);
        }

        // Generate unique filename
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String fileName = UUID.randomUUID().toString() + fileExtension;
        Path filePath = courseDirPath.resolve(fileName);

        // Save file
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        logger.info("File saved to: {}", filePath);

        // Create resource entity
        CourseResource resource = new CourseResource();
        resource.setCourse(course);
        resource.setTitle(title);
        resource.setFilePath(filePath.toString());
        resource.setUploadedBy(uploader);
        resource.setFileSize(file.getSize());

        CourseResource savedResource = courseResourceRepository.save(resource);
        logger.info("Resource saved to database with ID: {}", savedResource.getId());

        return savedResource;
    }

    public List<CourseResource> getCourseResources(Long courseId) {
        logger.info("Fetching resources for course ID: {}", courseId);
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));
        return courseResourceRepository.findByCourseOrderByCreatedAtDesc(course);
    }

    public List<CourseResource> getResourcesForEnrolledStudent(Long courseId, String studentEmail) {
        logger.info("Fetching resources for course ID: {} and student: {}", courseId, studentEmail);

        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        // Verify user is a student
        if (!student.getRole().equals(User.Role.STUDENT)) {
            throw new ForbiddenAccessException("This endpoint is only for students");
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with ID: " + courseId));

        // ENROLLMENT CHECK: Verify student is enrolled in the course
        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new ForbiddenAccessException("You must be enrolled in this course to access its resources"));

        return courseResourceRepository.findByCourseOrderByCreatedAtDesc(course);
    }

    public CourseResource getResourceById(Long resourceId) {
        return courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + resourceId));
    }

    @Transactional
    public void deleteResource(Long resourceId, String userEmail) {
        logger.info("Deleting resource ID: {} by user: {}", resourceId, userEmail);

        CourseResource resource = courseResourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with ID: " + resourceId));

        // Get user
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // OWNERSHIP CHECK: Admin can delete any, Instructor can delete only their course resources
        if (!user.getRole().equals(User.Role.ADMIN)) {
            if (!user.getRole().equals(User.Role.INSTRUCTOR)) {
                throw new ForbiddenAccessException("Only instructors and admins can delete resources");
            }
            // Verify instructor owns the course
            if (!resource.getCourse().getInstructor().getId().equals(user.getId())) {
                throw new ForbiddenAccessException("You can only delete resources from your own courses");
            }
        }

        logger.info("User {} has permission to delete resource {}", userEmail, resourceId);

        // Delete physical file
        try {
            Path filePath = Paths.get(resource.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                logger.info("Physical file deleted: {}", filePath);
            }
        } catch (IOException e) {
            logger.error("Error deleting physical file: {}", e.getMessage());
        }

        // Delete from database
        courseResourceRepository.delete(resource);
        logger.info("Resource deleted from database");
    }

    public boolean canAccessResource(Long resourceId, String userEmail) {
        CourseResource resource = getResourceById(resourceId);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Admin can access everything
        if (user.getRole().equals(User.Role.ADMIN)) {
            logger.info("Admin {} granted access to resource {}", userEmail, resourceId);
            return true;
        }

        // OWNERSHIP CHECK: Instructor can access resources of their courses
        if (user.getRole().equals(User.Role.INSTRUCTOR)) {
            boolean hasAccess = resource.getCourse().getInstructor().getId().equals(user.getId());
            logger.info("Instructor {} {} access to resource {}", userEmail, hasAccess ? "granted" : "denied", resourceId);
            return hasAccess;
        }

        // ENROLLMENT CHECK: Student can access if enrolled
        if (user.getRole().equals(User.Role.STUDENT)) {
            boolean hasAccess = enrollmentRepository.findByStudentAndCourse(user, resource.getCourse()).isPresent();
            logger.info("Student {} {} access to resource {}", userEmail, hasAccess ? "granted" : "denied", resourceId);
            return hasAccess;
        }

        logger.warn("User {} with role {} denied access to resource {}", userEmail, user.getRole(), resourceId);
        return false;
    }

    // ADMIN: Get all resources across all courses
    public List<CourseResource> getAllResources() {
        logger.info("Fetching all resources for admin");
        return courseResourceRepository.findAll();
    }
}
