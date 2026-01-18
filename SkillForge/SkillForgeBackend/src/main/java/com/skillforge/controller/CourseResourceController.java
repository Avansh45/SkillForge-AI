package com.skillforge.controller;

import com.skillforge.entity.CourseResource;
import com.skillforge.entity.User;
import com.skillforge.exception.ForbiddenAccessException;
import com.skillforge.exception.InvalidRequestException;
import com.skillforge.exception.ResourceNotFoundException;
import com.skillforge.repository.UserRepository;
import com.skillforge.service.CourseResourceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "*")
public class CourseResourceController {

    private static final Logger logger = LoggerFactory.getLogger(CourseResourceController.class);

    @Autowired
    private CourseResourceService courseResourceService;

    @Autowired
    private UserRepository userRepository;

    // INSTRUCTOR: Upload PDF for own course
    @PostMapping("/course/{courseId}/upload")
    public ResponseEntity<Map<String, Object>> uploadResource(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            logger.info("Upload request for course ID: {} by user: {}", courseId, authentication.getName());

            CourseResource resource = courseResourceService.uploadResource(
                    courseId, title, file, authentication.getName());

            Map<String, Object> response = new HashMap<>();
            response.put("id", resource.getId());
            response.put("title", resource.getTitle());
            response.put("courseId", resource.getCourse().getId());
            response.put("fileSize", resource.getFileSize());
            response.put("createdAt", resource.getCreatedAt());
            response.put("uploadedBy", resource.getUploadedBy().getName());

            return ResponseEntity.ok(response);
        } catch (InvalidRequestException e) {
            logger.error("Invalid request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (ForbiddenAccessException e) {
            logger.error("Access forbidden: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            logger.error("Error uploading resource: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    // STUDENT/INSTRUCTOR/ADMIN: List resources of course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<?> getCourseResources(
            @PathVariable Long courseId,
            Authentication authentication) {
        try {
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            List<CourseResource> resources;

            // If student, check enrollment
            if (user.getRole().equals(User.Role.STUDENT)) {
                resources = courseResourceService.getResourcesForEnrolledStudent(courseId, authentication.getName());
            } else {
                // Instructor and Admin can view all resources
                resources = courseResourceService.getCourseResources(courseId);
            }

            List<Map<String, Object>> response = resources.stream()
                    .map(resource -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", resource.getId());
                        map.put("title", resource.getTitle());
                        map.put("fileSize", resource.getFileSize());
                        map.put("createdAt", resource.getCreatedAt());
                        map.put("uploadedBy", resource.getUploadedBy().getName());
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (ForbiddenAccessException e) {
            logger.error("Access forbidden: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error fetching resources: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    // ALL AUTHENTICATED: Stream PDF (with access control)
    @GetMapping("/{resourceId}/view")
    public ResponseEntity<Resource> viewResource(
            @PathVariable Long resourceId,
            Authentication authentication) {
        try {
            logger.info("View request for resource ID: {} by user: {}", resourceId, authentication.getName());

            // Check if user can access this resource
            if (!courseResourceService.canAccessResource(resourceId, authentication.getName())) {
                logger.warn("User {} denied access to view resource {}", authentication.getName(), resourceId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            CourseResource resource = courseResourceService.getResourceById(resourceId);
            Path filePath = Paths.get(resource.getFilePath());
            Resource fileResource = new UrlResource(filePath.toUri());

            if (fileResource.exists() && fileResource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getTitle() + ".pdf\"")
                        .body(fileResource);
            } else {
                logger.error("File not found or not readable: {}", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error viewing resource: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ALL AUTHENTICATED: Download PDF (with access control)
    @GetMapping("/{resourceId}/download")
    public ResponseEntity<Resource> downloadResource(
            @PathVariable Long resourceId,
            Authentication authentication) {
        try {
            logger.info("Download request for resource ID: {} by user: {}", resourceId, authentication.getName());

            // Check if user can access this resource
            if (!courseResourceService.canAccessResource(resourceId, authentication.getName())) {
                logger.warn("User {} denied access to download resource {}", authentication.getName(), resourceId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            CourseResource resource = courseResourceService.getResourceById(resourceId);
            Path filePath = Paths.get(resource.getFilePath());
            Resource fileResource = new UrlResource(filePath.toUri());

            if (fileResource.exists() && fileResource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_PDF)
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getTitle() + ".pdf\"")
                        .body(fileResource);
            } else {
                logger.error("File not found or not readable: {}", filePath);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            logger.error("Error downloading resource: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // INSTRUCTOR & ADMIN: Delete resource (instructors can delete only their own course resources)
    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Map<String, String>> deleteResource(
            @PathVariable Long resourceId,
            Authentication authentication) {
        try {
            logger.info("Delete request for resource ID: {} by user: {}", resourceId, authentication.getName());

            courseResourceService.deleteResource(resourceId, authentication.getName());

            return ResponseEntity.ok(Map.of("message", "Resource deleted successfully"));
        } catch (ResourceNotFoundException e) {
            logger.error("Resource not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (ForbiddenAccessException e) {
            logger.error("Access forbidden: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error deleting resource: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }

    // ADMIN: Get all resources across platform
    @GetMapping("/all")
    public ResponseEntity<?> getAllResources(Authentication authentication) {
        try {
            logger.info("Fetching all resources by admin: {}", authentication.getName());

            List<CourseResource> resources = courseResourceService.getAllResources();

            List<Map<String, Object>> response = resources.stream()
                    .map(resource -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", resource.getId());
                        map.put("title", resource.getTitle());
                        map.put("fileSize", resource.getFileSize());
                        map.put("createdAt", resource.getCreatedAt());
                        map.put("uploadedBy", resource.getUploadedBy().getName());
                        map.put("uploadedByEmail", resource.getUploadedBy().getEmail());
                        map.put("courseId", resource.getCourse().getId());
                        map.put("courseTitle", resource.getCourse().getTitle());
                        map.put("instructorName", resource.getCourse().getInstructor().getName());
                        map.put("instructorEmail", resource.getCourse().getInstructor().getEmail());
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error fetching all resources: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }
}
