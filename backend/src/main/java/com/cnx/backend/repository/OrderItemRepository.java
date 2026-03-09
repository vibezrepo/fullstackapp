package com.cnx.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cnx.backend.entity.OrderItem;
import com.cnx.backend.entity.Product;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByProduct(Product product);
    void deleteByProduct(Product product);
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("delete from OrderItem oi where oi.product.id = :productId")
    void deleteByProductId(Long productId);
}
