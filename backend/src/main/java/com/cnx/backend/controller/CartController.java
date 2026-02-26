package com.cnx.backend.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.cnx.backend.dto.AddToCartRequest;
import com.cnx.backend.dto.CartDto;
import com.cnx.backend.entity.User;
import com.cnx.backend.repository.UserRepository;
import com.cnx.backend.service.CartService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@CrossOrigin
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    /**
     * Get current user's cart
     */
    @GetMapping
    public CartDto getCart() {
        User user = getCurrentUser();
        return cartService.getCart(user);
    }

    /**
     * Add product to cart
     */
    @PostMapping("/add")
    public CartDto addToCart(@RequestBody AddToCartRequest request) {
        User user = getCurrentUser();
        return cartService.addToCart(user, request);
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/items/{cartItemId}")
    public CartDto removeFromCart(@PathVariable Long cartItemId) {
        User user = getCurrentUser();
        return cartService.removeFromCart(user, cartItemId);
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/items/{cartItemId}/quantity")
    public CartDto updateQuantity(@PathVariable Long cartItemId, @RequestParam Integer quantity) {
        User user = getCurrentUser();
        return cartService.updateCartItemQuantity(user, cartItemId, quantity);
    }

    /**
     * Clear entire cart
     */
    @DeleteMapping
    public void clearCart() {
        User user = getCurrentUser();
        cartService.clearCart(user);
    }

    /**
     * Get current authenticated user from security context
     */
    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
