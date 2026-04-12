package com.shopease.cart.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CartDto {
    private Long id;
    private Long userId;
    private List<CartItemDto> items;
    private Double subtotal;
    private Double tax;
    private Double discount;
    private Double total;
    private Integer itemCount;
    private LocalDateTime updatedAt;
}
