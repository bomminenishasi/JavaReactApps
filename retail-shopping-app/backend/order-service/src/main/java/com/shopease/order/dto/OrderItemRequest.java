package com.shopease.order.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long productId;
    private String productName;
    private String sku;
    private Integer quantity;
    private Double unitPrice;
}
