package com.cnx.backend.dto;

import lombok.Data;

@Data
public class OrderItemSummaryDto {
    private String productName;
    private Integer quantity;
}
