package com.cnx.backend.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private AddressDto address;
    private String paymentMethod;

    // Optional dates provided by the customer
    // Format expected: YYYY-MM-DD
    private String pickDate;
    private String deliveryDate;

    private CardDto card;          // optional, required when paymentMethod == "card"
}