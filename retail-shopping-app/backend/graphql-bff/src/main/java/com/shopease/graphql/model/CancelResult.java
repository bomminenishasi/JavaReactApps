package com.shopease.graphql.model;

import lombok.Data;

@Data
public class CancelResult {
    private String id;
    private String orderNumber;
    private String status;
}
