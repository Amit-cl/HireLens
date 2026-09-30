package com.hirelens.auth;

import com.hirelens.exception.BadRequestException;
import com.hirelens.exception.ResourceNotFoundException;
import com.hirelens.security.JwtService;
import com.hirelens.user.Role;
import com.hirelens.user.User;
import com.hirelens.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
            .name(request.getName().trim())
            .email(request.getEmail().trim().toLowerCase())
            .password(passwordEncoder.encode(request.getPassword()))
            .role(request.getRole() != null ? request.getRole() : Role.USER)
            .build();

        User savedUser = userRepository.save(user);

        Map<String, Object> extraClaims = Map.of(
            "userId", savedUser.getId(),
            "role", savedUser.getRole().name()
        );
        String jwtToken = jwtService.generateToken(extraClaims, savedUser);

        return AuthResponse.builder()
            .token(jwtToken)
            .type("Bearer")
            .id(savedUser.getId())
            .name(savedUser.getName())
            .email(savedUser.getEmail())
            .role(savedUser.getRole())
            .createdAt(savedUser.getCreatedAt())
            .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        Map<String, Object> extraClaims = Map.of(
            "userId", user.getId(),
            "role", user.getRole().name()
        );
        String jwtToken = jwtService.generateToken(extraClaims, user);

        return AuthResponse.builder()
            .token(jwtToken)
            .type("Bearer")
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
