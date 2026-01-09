package com.hospital.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                      SECURITY CONFIGURATION                                  ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  WHY THIS CLASS EXISTS:                                                      ║
 * ║  Configures Spring Security for the auth service.                            ║
 * ║                                                                              ║
 * ║  // Security will be reinforced in Subject 3                                 ║
 * ║                                                                              ║
 * ║  IMPORTANT: This is a MINIMAL configuration.                                 ║
 * ║  Students MUST implement proper security in Subject 3:                       ║
 * ║    - JWT filter                                                              ║
 * ║    - Proper endpoint protection                                              ║
 * ║    - CORS configuration                                                      ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Password encoder using BCrypt.
     * WHY BCrypt: Strong, adaptive hashing algorithm.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Security filter chain configuration.
     * // Security will be reinforced in Subject 3
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF for stateless API
            // WHY: We use JWT tokens, not sessions
            .csrf(AbstractHttpConfigurer::disable)
            
            // Stateless session management
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Authorization rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                
                // All other endpoints require authentication
                // TODO: Implement proper JWT filter in Subject 3
                .anyRequest().authenticated()
            );

        // TODO: Add JWT authentication filter in Subject 3
        // http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

