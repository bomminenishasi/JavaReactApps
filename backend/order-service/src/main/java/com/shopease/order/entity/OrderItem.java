package com.shopease.order.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ORDER_ITEMS")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "oi_seq")
    @SequenceGenerator(name = "oi_seq", sequenceName = "ORDER_ITEM_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ORDER_ID", nullable = false)
    private Order order;

    @Column(name = "PRODUCT_ID", nullable = false) private Long productId;
    @Column(name = "PRODUCT_NAME", nullable = false, length = 200) private String productName;
    @Column(nullable = false, length = 50) private String sku;
    @Column(nullable = false) private Integer quantity;
    @Column(name = "UNIT_PRICE", nullable = false) private Double unitPrice;
    @Column(name = "TOTAL_PRICE", nullable = false) private Double totalPrice;
}
