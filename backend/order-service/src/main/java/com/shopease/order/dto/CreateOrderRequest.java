package com.shopease.order.dto;

import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {
    private Long userId;
    private String cartId;
    private AddressDto shippingAddress;
    private AddressDto billingAddress;
    private String paymentMethod;
    private List<OrderItemRequest> items;
    private Double subtotal;
    private Double tax;
    private Double shippingCost;
    private Double discount;
    private Double total;
}
