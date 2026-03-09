package com.cnx.backend.controller;

import java.util.Collections;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import com.cnx.backend.dto.CheckoutRequest;
import com.cnx.backend.entity.User;
import com.cnx.backend.repository.UserRepository;
import com.cnx.backend.service.CartService;
import com.cnx.backend.dto.OrderSummaryDto;

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
        // require card fields when method is card
        if ("card".equalsIgnoreCase(request.getPaymentMethod())) {
            if (request.getCard() == null) {
                throw new IllegalArgumentException("Card details required for card payment");
            }
        }
        System.out.println("Checkout payload: " + request);
        cartService.checkout(user, request);
        return Collections.singletonMap("message", "Order placed successfully");
    }

    @GetMapping("/orders")
    public java.util.List<OrderSummaryDto> myOrders() {
        User user = getCurrentUser();
        return cartService.getOrderSummaries(user);
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
