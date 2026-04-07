package com.banking.transactions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionEvent {
    private Long txnId;
    private Long fromAccountId;
    private Long toAccountId;
    private BigDecimal amount;
    private String txnType;
    private String referenceNo;
}
