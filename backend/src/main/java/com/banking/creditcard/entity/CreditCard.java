package com.banking.creditcard.entity;

import com.banking.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_cards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreditCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "card_id")
    private Long cardId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "card_number", nullable = false, unique = true)
    private String cardNumber;

    @Column(name = "card_type", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CardType cardType = CardType.STANDARD;

    @Column(name = "credit_limit", nullable = false, precision = 15, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "current_balance", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal currentBalance = BigDecimal.ZERO;

    @Column(name = "available_credit", precision = 15, scale = 2)
    private BigDecimal availableCredit;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "minimum_payment", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minimumPayment = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CardStatus status = CardStatus.ACTIVE;

    @Column(name = "reward_points")
    @Builder.Default
    private Long rewardPoints = 0L;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum CardType {
        STANDARD, GOLD, PLATINUM;

        public double getRewardMultiplier() {
            return switch (this) {
                case STANDARD -> 1.5;
                case GOLD -> 2.0;
                case PLATINUM -> 3.0;
            };
        }

        public BigDecimal getCreditLimit() {
            return switch (this) {
                case STANDARD -> new BigDecimal("5000");
                case GOLD -> new BigDecimal("15000");
                case PLATINUM -> new BigDecimal("50000");
            };
        }
    }

    public enum CardStatus { ACTIVE, SUSPENDED, CLOSED }
}
