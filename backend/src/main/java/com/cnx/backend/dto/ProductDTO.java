package com.cnx.backend.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private Double price;
    private String category;
    private String description;
}
