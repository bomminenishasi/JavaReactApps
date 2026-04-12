package com.shopease.graphql.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Order {
    private String id;
    private String orderNumber;
    private String userId;
    private List<OrderItem> items;
    private Address shippingAddress;
    private Address billingAddress;
    private String status;
    private String paymentStatus;
    private Double subtotal;
    private Double tax;
    private Double shippingCost;
    private Double discount;
    private Double total;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
