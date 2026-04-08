package com.banking.accounts.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * Used for both simple account creation (SAVINGS) and full checking account applications.
 * Checking-specific fields are optional in the DTO; the service validates them when
 * accountType == CHECKING.
 */
@Data
public class CreateAccountRequest {

    @NotNull(message = "Account type is required")
    private String accountType; // SAVINGS or CHECKING

    private String currency = "USD";

    // ── Checking account application fields (validated in service when type=CHECKING) ──

    private String firstName;
    private String lastName;
    private String dateOfBirth;  // ISO: YYYY-MM-DD

    /** Full SSN in ###-##-#### format — only last 4 digits stored */
    @Pattern(regexp = "^(\\d{3}-\\d{2}-\\d{4})?$", message = "SSN must be in format ###-##-####")
    private String ssn;

    private String countryOfCitizenship;

    @Pattern(regexp = "^(\\+?[0-9\\-\\s()]{7,15})?$", message = "Invalid phone number")
    private String phoneNumber;

    private String streetAddress;
    private String city;
    private String state;

    @Pattern(regexp = "^(\\d{5}(-\\d{4})?)?$", message = "Invalid ZIP code")
    private String zipCode;

    @DecimalMin(value = "0.0", message = "Annual income must be non-negative")
    private BigDecimal annualIncome;

    private String employmentStatus;

    private Boolean agreedToTerms;
}
