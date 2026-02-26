package com.cnx.backend.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToCartRequest {
    private Long productId;
    private Integer quantity;
}
