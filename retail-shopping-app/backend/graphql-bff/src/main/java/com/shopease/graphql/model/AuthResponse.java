package com.shopease.graphql.model;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String refreshToken;
    private Long expiresIn;
    private User user;
}
