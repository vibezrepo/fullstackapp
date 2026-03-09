package com.cnx.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cnx.backend.dto.AddToCartRequest;
import com.cnx.backend.dto.CartDto;
import com.cnx.backend.dto.CartItemDto;
import com.cnx.backend.dto.CheckoutRequest;
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

import com.cnx.backend.entity.Order;
import com.cnx.backend.entity.OrderItem;
import com.cnx.backend.repository.OrderRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

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
            // ensure the in-memory cart has a reference
            if (!cart.getItems().contains(item)) {
                cart.getItems().add(item);
            }
        } else {
            // Add new item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            cartItemRepository.save(newItem);
            // keep cart collection in sync so lazy loading later will see it
            cart.getItems().add(newItem);
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
        // remove item from both repository and cart's collection to avoid merge of deleted instance
        cartItemRepository.findById(cartItemId).ifPresent(item -> {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        });
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
            // remove from cart collection before deleting to keep Hibernate session consistent
            cart.getItems().remove(item);
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

    /**
     * Perform checkout for the user. Currently this simply clears the cart;
     * in a real application this could create an order record, send an email, etc.
     */
    public void checkout(User user) {
        // placeholder business logic without details
        clearCart(user);
    }

    /**
     * Checkout with details; stores or logs the request for processing.
     */
    public Order checkout(User user, com.cnx.backend.dto.CheckoutRequest request) {
        // create persistent order
        Order order = new Order();
        order.setUser(user);
        order.setAddressName(request.getAddress().getName());
        order.setAddressStreet(request.getAddress().getStreet());
        order.setAddressCity(request.getAddress().getCity());
        order.setAddressState(request.getAddress().getState());
        order.setAddressZip(request.getAddress().getZip());
        order.setAddressCountry(request.getAddress().getCountry());
        order.setPaymentMethod(request.getPaymentMethod());
        if ("card".equalsIgnoreCase(request.getPaymentMethod()) && request.getCard() != null) {
            String num = request.getCard().getNumber();
            order.setCardLast4(num == null ? null : num.substring(Math.max(0, num.length()-4)));
            order.setCardExpiry(request.getCard().getExpiry());
        }

        // attach items from cart
        Cart cart = getOrCreateCart(user);
        for (CartItem item : cart.getItems()) {
            OrderItem oitem = new OrderItem();
            oitem.setOrder(order);
            oitem.setProduct(item.getProduct());
            oitem.setQuantity(item.getQuantity());
            oitem.setPrice(item.getProduct().getPrice());
            order.getItems().add(oitem);
        }
        orderRepository.save(order);
        System.out.println("Saved order " + order.getId());

        // clear cart afterwards
        clearCart(user);

        return order;
    }

    /**
     * Retrieve past orders for a user
     */
    public java.util.List<Order> getOrders(User user) {
        return orderRepository.findByUserId(user.getId());
    }

    /**
     * Return simplified order summaries for UI consumption
     */
    public java.util.List<com.cnx.backend.dto.OrderSummaryDto> getOrderSummaries(User user) {
        return orderRepository.findByUserId(user.getId()).stream().map(order -> {
            com.cnx.backend.dto.OrderSummaryDto dto = new com.cnx.backend.dto.OrderSummaryDto();
            dto.setUserEmail(user.getEmail());
            com.cnx.backend.dto.AddressDto addr = new com.cnx.backend.dto.AddressDto();
            addr.setName(order.getAddressName());
            addr.setStreet(order.getAddressStreet());
            addr.setCity(order.getAddressCity());
            addr.setState(order.getAddressState());
            addr.setZip(order.getAddressZip());
            addr.setCountry(order.getAddressCountry());
            dto.setAddress(addr);
            dto.setPaymentMethod(order.getPaymentMethod());
            dto.setCardLast4(order.getCardLast4());
            dto.setCardExpiry(order.getCardExpiry());
            java.util.List<com.cnx.backend.dto.OrderItemSummaryDto> items = order.getItems().stream().map(i -> {
                com.cnx.backend.dto.OrderItemSummaryDto itemDto = new com.cnx.backend.dto.OrderItemSummaryDto();
                itemDto.setProductName(i.getProduct().getName());
                itemDto.setQuantity(i.getQuantity());
                return itemDto;
            }).toList();
            dto.setItems(items);
            return dto;
        }).toList();
    }
}