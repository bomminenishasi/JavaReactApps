package com.banking.payments.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreatePaymentRequest {
    @NotNull(message = "Account ID is required")
    private Long accountId;

    @NotBlank(message = "Payee name is required")
    private String payeeName;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;
}
