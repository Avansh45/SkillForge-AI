package com.skillforge.service;

import com.skillforge.dto.VideoRequest;
import com.skillforge.entity.Course;
import com.skillforge.entity.Video;
import com.skillforge.repository.CourseRepository;
import com.skillforge.repository.VideoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class VideoService {

    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Value("${app.video.upload-dir}")
    private String uploadDir;

    public Video uploadVideo(Long courseId, VideoRequest request, MultipartFile file) throws IOException {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Video video = new Video();
        video.setTitle(request.getTitle());
        video.setDescription(request.getDescription());
        video.setCourse(course);

        if (file != null && !file.isEmpty()) {
            video.setVideoType(Video.VideoType.UPLOADED);
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            video.setFilePath(filePath.toString());
        } else if (request.getExternalUrl() != null && !request.getExternalUrl().isEmpty()) {
            video.setVideoType(Video.VideoType.valueOf(request.getVideoType()));
            video.setExternalUrl(request.getExternalUrl());
        } else {
            throw new RuntimeException("Either file or external URL must be provided");
        }

        return videoRepository.save(video);
    }

    public Video addVideoLink(Long courseId, VideoRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        Video video = new Video();
        video.setTitle(request.getTitle());
        video.setDescription(request.getDescription());
        video.setCourse(course);
        video.setVideoType(Video.VideoType.valueOf(request.getVideoType()));
        video.setExternalUrl(request.getExternalUrl());

        return videoRepository.save(video);
    }

    public List<Video> getCourseVideos(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return videoRepository.findByCourse(course);
    }

    public void deleteVideo(Long videoId) {
        videoRepository.deleteById(videoId);
    }
}

