package com.cnx.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cnx.backend.entity.CartItem;
import com.cnx.backend.entity.Cart;
import com.cnx.backend.entity.Product;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}
