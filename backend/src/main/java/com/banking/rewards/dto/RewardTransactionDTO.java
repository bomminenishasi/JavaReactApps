package com.banking.rewards.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RewardTransactionDTO {
    private Long rewardTxnId;
    private Long points;
    private String txnType;
    private String description;
    private String referenceId;
    private LocalDateTime createdAt;
}
