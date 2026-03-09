package com.cnx.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.cnx.backend.entity.Product;
import com.cnx.backend.exception.ResourceNotFoundException;
import com.cnx.backend.repository.ProductRepository;
import com.cnx.backend.repository.CartItemRepository;
import com.cnx.backend.repository.OrderItemRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found");
        }
        // remove any cart or order items that reference this product using bulk JPQL
        cartItemRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);
        // flush deletions before removing product
        productRepository.flush();

        try {
            productRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            throw new IllegalStateException("Product cannot be deleted because it is referenced by existing records", ex);
        }
    }
}

