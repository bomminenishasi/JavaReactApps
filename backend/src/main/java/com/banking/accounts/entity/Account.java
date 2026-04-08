package com.banking.accounts.entity;

import com.banking.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long accountId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "account_number", nullable = false, unique = true)
    private String accountNumber;

    @Column(name = "account_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private AccountType accountType;

    @Column(nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(length = 3)
    @Builder.Default
    private String currency = "USD";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountStatus status = AccountStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // ── Checking account application fields ──────────────────────────────────

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    /** Stores only last 4 digits of SSN (e.g. "5678") */
    @Column(name = "ssn_last4", length = 4)
    private String ssnLast4;

    @Column(name = "country_of_citizenship")
    private String countryOfCitizenship;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "street_address")
    private String streetAddress;

    @Column(name = "city")
    private String city;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(name = "annual_income", precision = 15, scale = 2)
    private BigDecimal annualIncome;

    @Column(name = "employment_status")
    private String employmentStatus;

    public enum AccountType {
        SAVINGS, CHECKING
    }

    public enum AccountStatus {
        ACTIVE, SUSPENDED, CLOSED
    }
}
