package com.cnx.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cnx.backend.entity.Order;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
}
