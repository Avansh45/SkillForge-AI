package com.skillforge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();
        final String method = request.getMethod();

        System.out.println("\n=== JWT FILTER START ===");
        System.out.println("Request: " + method + " " + requestURI);
        System.out.println("Authorization Header Present: " + (authorizationHeader != null));

        String email = null;
        String jwt = null;
        String role = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                email = jwtUtil.getEmailFromToken(jwt);
                role = jwtUtil.getRoleFromToken(jwt);
                System.out.println("✓ Token parsed successfully");
                System.out.println("  Email: " + email);
                System.out.println("  Role: " + role);
                System.out.println("  Authority to set: ROLE_" + role);
            } catch (Exception e) {
                System.out.println("✗ Error parsing token: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("✗ No Bearer token found");
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("Validating token for email: " + email);
            if (jwtUtil.validateToken(jwt, email)) {
                System.out.println("✓ Token validation SUCCESS");
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role)));
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                System.out.println("✓ Authentication set: " + email);
                System.out.println("  Authorities: " + authToken.getAuthorities());
            } else {
                System.out.println("✗ Token validation FAILED");
            }
        } else {
            System.out.println("Skipping auth setup - email=" + email + ", existing-auth=" + (SecurityContextHolder.getContext().getAuthentication() != null));
        }
        System.out.println("=== JWT FILTER END ===\n");
        chain.doFilter(request, response);
    }
}

