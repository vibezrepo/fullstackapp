package com.cnx.backend.dto;

import lombok.Data;

@Data
public class CheckoutRequest {
    private AddressDto address;
    private String paymentMethod;
}