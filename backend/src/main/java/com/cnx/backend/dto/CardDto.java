package com.cnx.backend.dto;

import lombok.Data;

@Data
public class CardDto {
    private String number;
    private String expiry;
    private String cvv;
}