package com.cnx.backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderSummaryDto {
    private String userEmail;
    private AddressDto address;
    private String paymentMethod;
    private String cardLast4;
    private String cardExpiry;
    private List<OrderItemSummaryDto> items;
}