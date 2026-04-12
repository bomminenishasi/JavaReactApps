package com.shopease.graphql.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class User {
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Address address;
    private String role;
    private LocalDateTime createdAt;
}
