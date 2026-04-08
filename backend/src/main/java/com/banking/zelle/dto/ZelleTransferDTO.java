package com.banking.zelle.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ZelleTransferDTO {
    private Long transferId;
    private String recipientEmail;
    private String recipientPhone;
    private String recipientName;
    private BigDecimal amount;
    private String note;
    private String direction;
    private String status;
    private String fromAccountNumber;
    private LocalDateTime createdAt;
}
