package com.shopease.cart.dto;

import lombok.Data;

@Data
public class AddToCartRequest {
    private Long productId;
    private String productName;
    private String productSku;
    private Double unitPrice;
    private Integer quantity;
    private String imageUrl;
}
