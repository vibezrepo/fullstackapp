package com.cnx.backend.service;

import org.springframework.stereotype.Service;

import com.cnx.backend.dto.AuthResponse;
import com.cnx.backend.dto.LoginRequest;
import com.cnx.backend.dto.RegisterRequest;
import com.cnx.backend.entity.User;
import com.cnx.backend.repository.UserRepository;
import com.cnx.backend.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;



@Service

public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(encoder.encode(request.getPassword()));

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new AuthResponse(token);
    }

}
