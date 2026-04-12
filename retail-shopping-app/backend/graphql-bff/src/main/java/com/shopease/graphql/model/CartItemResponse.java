package com.shopease.graphql.model;

import lombok.Data;

@Data
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Double unitPrice;
    private Double totalPrice;
    private Integer quantity;
    private String imageUrl;
}
