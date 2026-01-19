package com.skillforge.service;

import com.skillforge.dto.AuthRequest;
import com.skillforge.dto.AuthResponse;
<<<<<<< HEAD
=======
import com.skillforge.dto.ChangePasswordRequest;
>>>>>>> TempBranch
import com.skillforge.dto.RegisterRequest;
import com.skillforge.entity.User;
import com.skillforge.repository.UserRepository;
import com.skillforge.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, null, null, "Email already registered");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return new AuthResponse(null, null, null, null, "Invalid role");
        }

<<<<<<< HEAD
=======
        // Restrict admin registration
        if (role == User.Role.ADMIN) {
            // Only allow one admin with specific credentials
            long adminCount = userRepository.countByRole(User.Role.ADMIN);
            if (adminCount > 0 ||
                !request.getName().equalsIgnoreCase("Avansh") ||
                !request.getPassword().equals("avansh@786")) {
                return new AuthResponse(null, null, null, null, "If You want to create Account as Admin Contact to the SkillForge team");
            }
        }

>>>>>>> TempBranch
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(role);

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name(), "Registration successful");
    }

<<<<<<< HEAD
=======
    public AuthResponse changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return new AuthResponse(null, null, null, null, "User not found");
        }
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return new AuthResponse(null, null, null, null, "Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name(), "Password changed successfully");
    }

>>>>>>> TempBranch
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(null, null, null, null, "Invalid email or password");
        }

        if (!user.getRole().name().equalsIgnoreCase(request.getRole())) {
            return new AuthResponse(null, null, null, null, "Role mismatch");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, user.getEmail(), user.getName(), user.getRole().name(), "Login successful");
    }
}

