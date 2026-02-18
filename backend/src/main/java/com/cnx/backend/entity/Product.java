package com.cnx.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double price;
    private String category;
    private String description;
}
