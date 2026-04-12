package com.shopease.graphql.model;

import lombok.Data;
import java.util.List;

@Data
public class ProductPage {
    private List<Product> content;
    private Integer totalElements;
    private Integer totalPages;
    private Integer currentPage;
    private Integer pageSize;
}
