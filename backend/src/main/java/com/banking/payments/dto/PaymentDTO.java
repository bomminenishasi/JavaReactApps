package com.banking.payments.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
public class PaymentDTO {
    private Long paymentId;
    private Long accountId;
    private String accountNumber;
    private String payeeName;
    private BigDecimal amount;
    private LocalDate scheduledDate;
    private String status;
    private LocalDateTime createdAt;
}
