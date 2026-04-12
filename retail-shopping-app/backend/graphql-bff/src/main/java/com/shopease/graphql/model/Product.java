package com.shopease.graphql.model;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Product {
    private String id;
    private String sku;
    private String name;
    private String description;
    private Double price;
    private Double originalPrice;
    private Category category;
    private String brand;
    private List<String> images;
    private Double rating;
    private Integer reviewCount;
    private Boolean inStock;
    private Integer stockQuantity;
    private List<String> tags;
    private LocalDateTime createdAt;
}
