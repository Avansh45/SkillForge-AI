package com.skillforge.controller;

import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getPlatformOverview(Authentication authentication) {
        long totalUsers = userRepository.count();
        long students = userRepository.countByRole(User.Role.STUDENT);
        long instructors = userRepository.countByRole(User.Role.INSTRUCTOR);
        long admins = userRepository.countByRole(User.Role.ADMIN);

        Map<String, Object> overview = new HashMap<>();
        overview.put("totalUsers", totalUsers);
        overview.put("students", students);
        overview.put("instructors", instructors);
        overview.put("admins", admins);

        return ResponseEntity.ok(overview);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Map<String, String>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            User.Role newRole = User.Role.valueOf(request.get("role").toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "User role updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
        }
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId, Authentication authentication) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}

