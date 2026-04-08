package com.banking.creditcard.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CreditCardDTO {
    private Long cardId;
    private String cardNumber;
    private String maskedNumber;
    private String cardType;
    private BigDecimal creditLimit;
    private BigDecimal currentBalance;
    private BigDecimal availableCredit;
    private LocalDate dueDate;
    private BigDecimal minimumPayment;
    private String status;
    private Long rewardPoints;
    private LocalDateTime createdAt;
    private double rewardMultiplier;
}
