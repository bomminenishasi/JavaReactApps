package com.shopease.order.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ORDERS")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
    @SequenceGenerator(name = "order_seq", sequenceName = "ORDER_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "ORDER_NUMBER", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "USER_ID", nullable = false)
    private Long userId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    @Column(name = "SHIPPING_STREET", length = 200) private String shippingStreet;
    @Column(name = "SHIPPING_CITY", length = 100) private String shippingCity;
    @Column(name = "SHIPPING_STATE", length = 50) private String shippingState;
    @Column(name = "SHIPPING_ZIP", length = 20) private String shippingZip;
    @Column(name = "SHIPPING_COUNTRY", length = 50) private String shippingCountry;

    @Column(name = "BILLING_STREET", length = 200) private String billingStreet;
    @Column(name = "BILLING_CITY", length = 100) private String billingCity;
    @Column(name = "BILLING_STATE", length = 50) private String billingState;
    @Column(name = "BILLING_ZIP", length = 20) private String billingZip;
    @Column(name = "BILLING_COUNTRY", length = 50) private String billingCountry;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "PAYMENT_STATUS", nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "PAYMENT_METHOD", length = 30)
    private String paymentMethod;

    @Column(nullable = false) private Double subtotal;
    @Column(nullable = false) @Builder.Default private Double tax = 0.0;
    @Column(name = "SHIPPING_COST", nullable = false) @Builder.Default private Double shippingCost = 0.0;
    @Column(nullable = false) @Builder.Default private Double discount = 0.0;
    @Column(nullable = false) private Double total;

    @Column(name = "ESTIMATED_DELIVERY")
    private LocalDateTime estimatedDelivery;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UPDATED_AT")
    private LocalDateTime updatedAt;
}
