package com.shopease.order.dto;

import com.shopease.order.entity.OrderStatus;
import com.shopease.order.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderDto {
    private Long id;
    private String orderNumber;
    private Long userId;
    private List<OrderItemDto> items;
    private AddressDto shippingAddress;
    private AddressDto billingAddress;
    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private Double subtotal;
    private Double tax;
    private Double shippingCost;
    private Double discount;
    private Double total;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
