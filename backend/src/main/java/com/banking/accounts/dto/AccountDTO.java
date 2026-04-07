package com.banking.accounts.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class AccountDTO {
    private Long accountId;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String currency;
    private String status;
    private Instant createdAt;
}
