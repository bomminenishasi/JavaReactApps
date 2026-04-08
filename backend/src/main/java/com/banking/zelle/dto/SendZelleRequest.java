package com.banking.zelle.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class SendZelleRequest {
    @NotNull
    private Long fromAccountId;
    private String recipientEmail;
    private String recipientPhone;
    private String recipientName;
    @NotNull @Positive
    private BigDecimal amount;
    private String note;
}
