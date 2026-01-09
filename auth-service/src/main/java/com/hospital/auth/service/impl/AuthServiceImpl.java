package com.hospital.auth.service.impl;

import com.hospital.auth.dto.AuthResponse;
import com.hospital.auth.dto.LoginRequest;
import com.hospital.auth.dto.RegisterRequest;
import com.hospital.auth.model.Role;
import com.hospital.auth.model.User;
import com.hospital.auth.repository.UserRepository;
import com.hospital.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                     AUTH SERVICE IMPLEMENTATION                              ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  WHY THIS CLASS EXISTS:                                                      ║
 * ║  Implements authentication logic.                                            ║
 * ║                                                                              ║
 * ║  // Security will be reinforced in Subject 3                                 ║
 * ║                                                                              ║
 * ║  IMPORTANT: This is a PLACEHOLDER implementation.                            ║
 * ║  Students MUST implement proper JWT handling in Subject 3.                   ║
 * ║  Current implementation is for structure demonstration only.                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    // TODO: Inject JwtService in Subject 3

    @Override
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user: {}", request.getUsername());

        // Check for existing user
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create user
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .staffId(request.getStaffId())
                .roles(Set.of(Role.ROLE_PATIENT)) // Default role
                .enabled(true)
                .accountNonLocked(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered with ID: {}", savedUser.getId());

        // TODO: Generate actual JWT tokens in Subject 3
        // // Security will be reinforced in Subject 3
        return AuthResponse.builder()
                .accessToken("placeholder-access-token")  // PLACEHOLDER
                .refreshToken("placeholder-refresh-token") // PLACEHOLDER
                .tokenType("Bearer")
                .expiresIn(3600L)
                .username(savedUser.getUsername())
                .roles(savedUser.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet()))
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for user: {}", request.getUsername());

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for user: {}", request.getUsername());
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        // TODO: Generate actual JWT tokens in Subject 3
        // // Security will be reinforced in Subject 3
        return AuthResponse.builder()
                .accessToken("placeholder-access-token")  // PLACEHOLDER
                .refreshToken("placeholder-refresh-token") // PLACEHOLDER
                .tokenType("Bearer")
                .expiresIn(3600L)
                .username(user.getUsername())
                .roles(user.getRoles().stream()
                        .map(Enum::name)
                        .collect(Collectors.toSet()))
                .build();
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        log.debug("Refreshing token");
        // TODO: Implement token refresh in Subject 3
        // // Security will be reinforced in Subject 3
        throw new UnsupportedOperationException("Token refresh not implemented - Subject 3");
    }

    @Override
    public boolean validateToken(String token) {
        log.debug("Validating token");
        // TODO: Implement token validation in Subject 3
        // // Security will be reinforced in Subject 3
        return false; // PLACEHOLDER
    }
}

