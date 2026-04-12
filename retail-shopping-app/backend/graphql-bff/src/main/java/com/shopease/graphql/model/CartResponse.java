package com.shopease.graphql.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> items;
    private Double subtotal;
    private Double tax;
    private Double discount;
    private Double total;
    private Integer itemCount;
    private LocalDateTime updatedAt;
}
