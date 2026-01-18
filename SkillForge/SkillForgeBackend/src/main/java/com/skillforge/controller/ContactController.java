package com.skillforge.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*")
public class ContactController {

    @PostMapping
    public ResponseEntity<Map<String, String>> submitContact(@RequestBody Map<String, String> request) {
        

        // String name = request.get("name");
        // String email = request.get("email");
        // String message = request.get("message");
        
        return ResponseEntity.ok(Map.of("message", "Thank you for your message. We will contact you soon."));
    }
}

