package com.banking.creditcard.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CardPaymentRequest {
    @NotNull
    private Long fromAccountId;
    @NotNull @Positive
    private BigDecimal amount;
}
