package com.shopease.graphql.model;

import lombok.Data;

@Data
public class RegisterInput {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
}
