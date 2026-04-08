package com.banking.creditcard.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApplyCardRequest {
    @NotBlank
    private String cardType; // STANDARD, GOLD, PLATINUM
}
