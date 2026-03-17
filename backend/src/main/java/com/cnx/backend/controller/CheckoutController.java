package com.cnx.backend.controller;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.cnx.backend.dto.CheckoutRequest;
import com.cnx.backend.entity.Order;
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
    public Map<String, Object> checkout(@RequestBody CheckoutRequest request) {
        User user = getCurrentUser();

        // require card fields when method is card
        if ("card".equalsIgnoreCase(request.getPaymentMethod())) {
            if (request.getCard() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Card details required for card payment");
            }
        }

        // validate that any client-provided dates are not in the future
        LocalDate today = LocalDate.now();
        if (request.getPickDate() != null) {
            try {
                LocalDate pickDate = LocalDate.parse(request.getPickDate());
                if (pickDate.isAfter(today)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pick date cannot be in the future");
                }
            } catch (DateTimeParseException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pickDate format (expected yyyy-MM-dd)");
            }
        }
        if (request.getDeliveryDate() != null) {
            try {
                LocalDate deliveryDate = LocalDate.parse(request.getDeliveryDate());
                if (deliveryDate.isAfter(today)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Delivery date cannot be in the future");
                }
            } catch (DateTimeParseException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid deliveryDate format (expected yyyy-MM-dd)");
            }
        }

        System.out.println("Checkout payload: " + request);
        Order order = cartService.checkout(user, request);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Order placed successfully");
        response.put("invoiceDate", order.getInvoiceDate() != null ? order.getInvoiceDate().toString() : null);
        return response;
    }

    @GetMapping("/orders")
    public java.util.List<OrderSummaryDto> myOrders() {
        User user = getCurrentUser();
        return cartService.getOrderSummaries(user);
    }

    @PostMapping("/orders/{orderId}/status")
    public Map<String, String> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status is required");
        }

        User user = getCurrentUser();
        try {
            var updated = cartService.updateOrderStatus(user, orderId, com.cnx.backend.entity.OrderStatus.valueOf(status.toUpperCase()));
            return Collections.singletonMap("status", updated.getStatus().name());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value");
        }
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
