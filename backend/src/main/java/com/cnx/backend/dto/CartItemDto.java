package com.cnx.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private Double productPrice;
    private Integer quantity;
    private Double subtotal;
}
