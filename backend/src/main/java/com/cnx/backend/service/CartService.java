package com.cnx.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cnx.backend.dto.AddToCartRequest;
import com.cnx.backend.dto.CartDto;
import com.cnx.backend.dto.CartItemDto;
import com.cnx.backend.entity.Cart;
import com.cnx.backend.entity.CartItem;
import com.cnx.backend.entity.Product;
import com.cnx.backend.entity.User;
import com.cnx.backend.repository.CartRepository;
import com.cnx.backend.repository.CartItemRepository;
import com.cnx.backend.repository.ProductRepository;

import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    /**
     * Get or create cart for a user
     */
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setCreatedAt(LocalDateTime.now());
                    return cartRepository.save(newCart);
                });
    }

    /**
     * Add product to cart
     */
    public CartDto addToCart(User user, AddToCartRequest request) {
        Cart cart = getOrCreateCart(user);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check if product already exists in cart
        var existingItem = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        
        return convertToDto(cart);
    }

    /**
     * Get cart for a user
     */
    public CartDto getCart(User user) {
        Cart cart = getOrCreateCart(user);
        return convertToDto(cart);
    }

    /**
     * Remove item from cart
     */
    public CartDto removeFromCart(User user, Long cartItemId) {
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteById(cartItemId);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return convertToDto(cart);
    }

    /**
     * Update cart item quantity
     */
    public CartDto updateCartItemQuantity(User user, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreateCart(user);
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return convertToDto(cart);
    }

    /**
     * Clear cart
     */
    public void clearCart(User user) {
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    /**
     * Convert Cart entity to CartDto
     */
    private CartDto convertToDto(Cart cart) {
        CartDto dto = new CartDto();
        dto.setId(cart.getId());
        dto.setItems(cart.getItems().stream()
                .map(this::convertItemToDto)
                .collect(Collectors.toList()));
        dto.setTotalPrice(cart.getTotalPrice());
        return dto;
    }

    /**
     * Convert CartItem entity to CartItemDto
     */
    private CartItemDto convertItemToDto(CartItem item) {
        CartItemDto dto = new CartItemDto();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductPrice(item.getProduct().getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}
