package com.banking.rewards.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RedeemRequest {
    @Positive
    private Long points;
    @NotBlank
    private String redeemType; // CASH, TRAVEL, GIFT_CARD
    private Long toAccountId;  // for CASH redemption
}
