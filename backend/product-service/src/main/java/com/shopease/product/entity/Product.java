package com.shopease.product.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "PRODUCTS")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "prod_seq")
    @SequenceGenerator(name = "prod_seq", sequenceName = "PRODUCT_SEQ", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String sku;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Double price;

    @Column(name = "ORIGINAL_PRICE")
    private Double originalPrice;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CATEGORY_ID", nullable = false)
    private Category category;

    @Column(length = 100)
    private String brand;

    @Column(length = 2000)
    private String images;

    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;

    @Column(name = "REVIEW_COUNT", nullable = false)
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(name = "IN_STOCK", nullable = false)
    @Builder.Default
    private Boolean inStock = true;

    @Column(name = "STOCK_QUANTITY", nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;

    @Column(length = 500)
    private String tags;

    @CreationTimestamp
    @Column(name = "CREATED_AT", updatable = false)
    private LocalDateTime createdAt;
}
