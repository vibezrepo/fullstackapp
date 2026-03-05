package com.cnx.backend.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cnx.backend.dto.CheckoutRequest;
import com.cnx.backend.entity.User;
import com.cnx.backend.repository.UserRepository;
import com.cnx.backend.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/checkout")
@CrossOrigin
@RequiredArgsConstructor
public class CheckoutController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @PostMapping
    public Map<String, String> checkout(@RequestBody CheckoutRequest request) {
        User user = getCurrentUser();
        // normally we'd persist order details, here we just log them
        System.out.println("Checkout payload: " + request);
        cartService.checkout(user, request);
        return Collections.singletonMap("message", "Order placed successfully");
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
