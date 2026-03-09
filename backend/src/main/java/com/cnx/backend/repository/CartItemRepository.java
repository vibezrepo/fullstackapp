package com.cnx.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cnx.backend.entity.CartItem;
import com.cnx.backend.entity.Cart;
import com.cnx.backend.entity.Product;
import java.util.Optional;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
    List<CartItem> findByProduct(Product product);
    // derived delete to remove all items associated with a product entity
    void deleteByProduct(Product product);
    // bulk delete by product id using JPQL to avoid entity instance mismatches
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from CartItem ci where ci.product.id = :productId")
    void deleteByProductId(Long productId);
}
