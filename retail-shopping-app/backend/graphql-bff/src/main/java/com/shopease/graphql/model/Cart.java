package com.shopease.graphql.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Cart {
    private String id;
    private String userId;
    private List<CartItem> items;
    private Double subtotal;
    private Double tax;
    private Double discount;
    private Double total;
    private Integer itemCount;
    private LocalDateTime updatedAt;
}
