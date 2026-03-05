package com.cnx.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cnx.backend.dto.CheckoutRequest;
import com.cnx.backend.dto.AddressDto;
import com.cnx.backend.entity.User;
import com.cnx.backend.service.CartService;
import com.cnx.backend.repository.UserRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = CheckoutController.class, excludeAutoConfiguration = org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class)
public class CheckoutControllerTest {

    @Autowired
    private MockMvc mvc;

    @MockBean
    private CartService cartService;

    @MockBean
    private UserRepository userRepository;

    // JWT filter/service will be auto-configured by security, mock to satisfy context
    @MockBean
    private com.cnx.backend.security.JwtService jwtService;

    @BeforeEach
    public void setupSecurityContext() {
        Authentication auth = org.mockito.Mockito.mock(Authentication.class);
        when(auth.getPrincipal()).thenReturn("test@example.com");
        SecurityContext sc = org.mockito.Mockito.mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);
    }

    @Test
    public void checkoutEndpointProcessesRequest() throws Exception {
        User user = new User();
        user.setEmail("test@example.com");
        when(userRepository.findByEmail("test@example.com")).thenReturn(java.util.Optional.of(user));

        CheckoutRequest req = new CheckoutRequest();
        AddressDto addr = new AddressDto();
        addr.setCity("City");
        req.setAddress(addr);
        req.setPaymentMethod("cod");

        String json = "{\"address\":{\"city\":\"City\"},\"paymentMethod\":\"cod\"}";

        mvc.perform(post("/api/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"message\":\"Order placed successfully\"}"));

        verify(cartService).checkout(user, any(CheckoutRequest.class));
    }
}
