package com.ridesharing.userservice.service;

import com.ridesharing.common.exception.BusinessException;
import com.ridesharing.common.exception.ResourceNotFoundException;
import com.ridesharing.userservice.dto.AuthResponse;
import com.ridesharing.userservice.dto.LoginRequest;
import com.ridesharing.userservice.dto.RegisterRequest;
import com.ridesharing.userservice.model.User;
import com.ridesharing.userservice.repository.UserRepository;
import com.ridesharing.userservice.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository   userRepository;
    private final JwtService       jwtService;
    private final PasswordEncoder  passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("Email already registered: " + req.getEmail());
        if (userRepository.existsByPhone(req.getPhone()))
            throw new BusinessException("Phone already registered: " + req.getPhone());

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(req.getRole())
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {} [{}]", user.getEmail(), user.getRole());
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new BusinessException("Invalid credentials"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword()))
            throw new BusinessException("Invalid credentials");

        if (!user.isActive())
            throw new BusinessException("Account is deactivated");

        log.info("User logged in: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(user))
                .refreshToken(jwtService.generateRefreshToken(user))
                .expiresIn(jwtService.getAccessExpiry())
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
