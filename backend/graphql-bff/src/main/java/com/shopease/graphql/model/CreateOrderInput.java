package com.shopease.graphql.model;

import lombok.Data;

@Data
public class CreateOrderInput {
    private String userId;
    private String cartId;
    private Address shippingAddress;
    private Address billingAddress;
    private String paymentMethod;
}
