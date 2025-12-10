package com.skillforge.controller;

import com.skillforge.dto.VideoRequest;
import com.skillforge.entity.Video;
import com.skillforge.service.VideoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses/{courseId}/videos")
@CrossOrigin(origins = "*")
public class VideoController {

    @Autowired
    private VideoService videoService;

    @PostMapping("/upload")
    public ResponseEntity<Video> uploadVideo(
            @PathVariable Long courseId,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            VideoRequest request = new VideoRequest();
            request.setTitle(title);
            request.setDescription(description);
            request.setVideoType("UPLOADED");
            Video video = videoService.uploadVideo(courseId, request, file);
            return ResponseEntity.ok(video);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/link")
    public ResponseEntity<Video> addVideoLink(
            @PathVariable Long courseId,
            @RequestBody VideoRequest request,
            Authentication authentication) {
        Video video = videoService.addVideoLink(courseId, request);
        return ResponseEntity.ok(video);
    }

    @GetMapping
    public ResponseEntity<List<Video>> getCourseVideos(@PathVariable Long courseId) {
        List<Video> videos = videoService.getCourseVideos(courseId);
        return ResponseEntity.ok(videos);
    }

    @DeleteMapping("/{videoId}")
    public ResponseEntity<Map<String, String>> deleteVideo(@PathVariable Long videoId, Authentication authentication) {
        videoService.deleteVideo(videoId);
        return ResponseEntity.ok(Map.of("message", "Video deleted successfully"));
    }
}

