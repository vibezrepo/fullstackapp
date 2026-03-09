package com.cnx.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.cnx.backend.dto.AddToCartRequest;
import com.cnx.backend.dto.AddressDto;
import com.cnx.backend.dto.CheckoutRequest;
import com.cnx.backend.entity.Order;
import com.cnx.backend.entity.Product;
import com.cnx.backend.entity.User;
import com.cnx.backend.repository.OrderRepository;
import com.cnx.backend.repository.ProductRepository;
import com.cnx.backend.repository.UserRepository;

@SpringBootTest
@Transactional // roll back any data changes after each test to keep database clean
public class CartServiceTest {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Test
    public void checkoutPersistsOrderAndClearsCart() {
        // clean up any leftover orders from previous tests
        orderRepository.deleteAll();

        User user = new User();
        // use timestamp to avoid duplicate email across test runs
        user.setEmail("test" + System.nanoTime() + "@domain.com");
        user = userRepository.saveAndFlush(user); // ensure ID is generated immediately
        assert user.getId() != null;

        Product prod = new Product();
        prod.setName("Test Item");
        prod.setPrice(5.0);
        prod = productRepository.save(prod);

        AddToCartRequest cartReq = new AddToCartRequest();
        cartReq.setProductId(prod.getId());
        cartReq.setQuantity(3);
        cartService.addToCart(user, cartReq);

        CheckoutRequest req = new CheckoutRequest();
        AddressDto addr = new AddressDto();
        addr.setName("Me");
        addr.setStreet("123 Street");
        addr.setCity("City");
        addr.setState("State");
        addr.setZip("00000");
        addr.setCountry("Country");
        req.setAddress(addr);
        req.setPaymentMethod("cod");

        Order ord = cartService.checkout(user, req);
        // the returned object should have been assigned an id
        assert ord.getId() != null;
        assertEquals(user.getId(), ord.getUser().getId());
        assertEquals("cod", ord.getPaymentMethod());
        assertEquals(1, ord.getItems().size());
        assertEquals(0, cartService.getCart(user).getItems().size());

        // now verify summary DTO
        var summaries = cartService.getOrderSummaries(user);
        assertEquals(1, summaries.size());
        var sum = summaries.get(0);
        assertEquals("cod", sum.getPaymentMethod());
        assertEquals(user.getEmail(), sum.getUserEmail());
        assertEquals(1, sum.getItems().size());
    }
}
