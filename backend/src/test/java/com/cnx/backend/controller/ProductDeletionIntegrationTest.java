package com.cnx.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
public class ProductDeletionIntegrationTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private com.cnx.backend.repository.ProductRepository productRepo;

    @Test
    public void deleteNonexistentProductShouldReturnNotFound() throws Exception {
        // deleting something that doesn't exist should return 404
        mvc.perform(delete("/api/products/99999")).andExpect(status().isNotFound());
    }

    @Test
    public void createThenDeleteProductShouldSucceed() throws Exception {
        // create a new product through repository
        com.cnx.backend.entity.Product p = new com.cnx.backend.entity.Product();
        p.setName("Temporary");
        p.setPrice(2.5);
        p = productRepo.saveAndFlush(p);

        mvc.perform(delete("/api/products/" + p.getId()))
            .andExpect(status().isNoContent());

        // second attempt yields not found
        mvc.perform(delete("/api/products/" + p.getId()))
            .andExpect(status().isNotFound());
    }
}
