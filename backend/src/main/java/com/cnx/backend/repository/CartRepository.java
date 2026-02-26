package com.cnx.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cnx.backend.entity.Cart;
import com.cnx.backend.entity.User;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUser(User user);
}
