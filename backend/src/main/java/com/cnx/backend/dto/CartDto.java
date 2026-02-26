package com.cnx.backend.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private List<CartItemDto> items;
    private Double totalPrice;
}
