package com.cnx.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cnx.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
