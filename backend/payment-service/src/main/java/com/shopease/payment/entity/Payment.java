package com.shopease.payment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "PAYMENTS")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pay_seq")
    @SequenceGenerator(name = "pay_seq", sequenceName = "PAYMENT_SEQ", allocationSize = 1)
    private Long id;

    @Column(name = "ORDER_ID", nullable = false) private Long orderId;
    @Column(name = "USER_ID", nullable = false) private Long userId;
    @Column(nullable = false) private Double amount;

    @Column(nullable = false, length = 30)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "PAYMENT_METHOD", length = 30) private String paymentMethod;
    @Column(name = "TRANSACTION_ID", length = 100) private String transactionId;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}
