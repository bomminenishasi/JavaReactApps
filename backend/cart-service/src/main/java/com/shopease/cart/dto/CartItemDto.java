package com.shopease.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Double unitPrice;
    private Double totalPrice;
    private Integer quantity;
    private String imageUrl;
}
