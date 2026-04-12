package com.shopease.graphql.model;

import lombok.Data;

@Data
public class CartItem {
    private String id;
    private Product product;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
}
