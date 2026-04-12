package com.shopease.cart.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CART_ITEMS")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ci_seq")
    @SequenceGenerator(name = "ci_seq", sequenceName = "CART_ITEM_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CART_ID", nullable = false)
    private Cart cart;

    @Column(name = "PRODUCT_ID", nullable = false) private Long productId;
    @Column(name = "PRODUCT_NAME", nullable = false, length = 200) private String productName;
    @Column(name = "PRODUCT_SKU", length = 50) private String productSku;
    @Column(name = "UNIT_PRICE", nullable = false) private Double unitPrice;
    @Column(nullable = false) private Integer quantity;
    @Column(name = "IMAGE_URL", length = 500) private String imageUrl;
}
