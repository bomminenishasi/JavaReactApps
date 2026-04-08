package com.banking.transactions.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransactionDTO {
    private Long txnId;
    private Long fromAccountId;
    private String fromAccountNumber;
    private Long toAccountId;
    private String toAccountNumber;
    private BigDecimal amount;
    private String txnType;
    private String status;
    private String referenceNo;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
}
