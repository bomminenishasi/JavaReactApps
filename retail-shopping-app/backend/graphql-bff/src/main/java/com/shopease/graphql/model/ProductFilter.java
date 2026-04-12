package com.shopease.graphql.model;

import lombok.Data;

@Data
public class ProductFilter {
    private String categoryId;
    private Double minPrice;
    private Double maxPrice;
    private String brand;
    private Boolean inStock;
    private String search;
    private String sortBy;
    private Integer page;
    private Integer size;
}
