package com.cnx.backend.service;

import org.springframework.stereotype.Service;

import com.cnx.backend.dto.LoginRequest;
import com.cnx.backend.dto.RegisterRequest;
import com.cnx.backend.entity.User;
import com.cnx.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;



@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public User register(RegisterRequest request) {

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());

        return userRepository.save(user);
    }

    public User login(LoginRequest request) {

        return userRepository.findByEmail(request.getEmail())
                .filter(u -> u.getPassword().equals(request.getPassword()))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
    }
}
