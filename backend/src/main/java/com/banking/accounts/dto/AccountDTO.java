package com.banking.accounts.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AccountDTO {
    private Long accountId;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String currency;
    private String status;
    private LocalDateTime createdAt;

    // Application details (no SSN — only last 4)
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String ssnLast4;
    private String countryOfCitizenship;
    private String phoneNumber;
    private String streetAddress;
    private String city;
    private String state;
    private String zipCode;
    private BigDecimal annualIncome;
    private String employmentStatus;
}
