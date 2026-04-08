package com.banking.users.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long userId;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String role;
    private boolean isActive;
    private LocalDateTime createdAt;
}
