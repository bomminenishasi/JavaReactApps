package com.shopease.graphql.model;

import lombok.Data;

@Data
public class Category {
    private String id;
    private String name;
    private String slug;
    private String parentId;
    private String imageUrl;
}
