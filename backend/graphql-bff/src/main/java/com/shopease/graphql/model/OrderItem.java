package com.shopease.graphql.model;

import lombok.Data;

@Data
public class OrderItem {
    private String id;
    private String productId;
    private String productName;
    private String sku;
    private Integer quantity;
    private Double unitPrice;
    private Double totalPrice;
}
