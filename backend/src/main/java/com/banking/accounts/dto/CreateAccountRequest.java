package com.banking.accounts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateAccountRequest {
    @NotNull(message = "Account type is required")
    private String accountType; // SAVINGS or CHECKING

    private String currency = "USD";
}
