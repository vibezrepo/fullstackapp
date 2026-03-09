package com.cnx.backend.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import com.cnx.backend.entity.User;
import com.cnx.backend.entity.Product;
import com.cnx.backend.repository.UserRepository;
import com.cnx.backend.repository.ProductRepository;
import com.cnx.backend.service.CartService;
import com.cnx.backend.dto.AddToCartRequest;
import com.cnx.backend.dto.CheckoutRequest;
import com.cnx.backend.dto.AddressDto;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductDeletionReferenceTest {
    @Autowired
    private MockMvc mvc;

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private ProductRepository productRepo;
    @Autowired
    private CartService cartService;

    @Test
    public void deleteReferencedProductSucceeds() throws Exception {
        // create user and product then add to cart
        User user = new User();
        user.setEmail("refuser" + System.nanoTime() + "@example.com");
        user = userRepo.saveAndFlush(user);

        Product p = new Product();
        p.setName("RefItem");
        p.setPrice(1.0);
        p = productRepo.saveAndFlush(p);

        AddToCartRequest acr = new AddToCartRequest();
        acr.setProductId(p.getId());
        acr.setQuantity(1);
        cartService.addToCart(user, acr); // synchronous service call

        // perform HTTP DELETE
        mvc.perform(delete("/api/products/" + p.getId()))
            .andExpect(status().isNoContent());

        // product should no longer exist in repository
        assert productRepo.findById(p.getId()).isEmpty();
        // cart should no longer include the item
        assert cartService.getCart(user).getItems().isEmpty();

    }
}
