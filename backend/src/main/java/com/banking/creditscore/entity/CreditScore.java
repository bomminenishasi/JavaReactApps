package com.banking.creditscore.entity;

import com.banking.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "credit_scores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CreditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "score_id")
    private Long scoreId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** FICO-style score: 300 – 850 */
    @Column(nullable = false)
    @Builder.Default
    private int score = 650;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ScoreCategory category = ScoreCategory.FAIR;

    /** Percentage 0-100 */
    @Column(name = "payment_history_pct")
    @Builder.Default
    private int paymentHistoryPct = 100;

    /** Percentage 0-100 (lower is better) */
    @Column(name = "credit_utilization_pct")
    @Builder.Default
    private int creditUtilizationPct = 0;

    /** Age of oldest account in months */
    @Column(name = "account_age_months")
    @Builder.Default
    private int accountAgeMonths = 0;

    /** 0 = only one type, 1 = savings+checking, 2 = savings+checking+card */
    @Column(name = "credit_mix")
    @Builder.Default
    private int creditMix = 0;

    @Column(name = "last_calculated")
    @Builder.Default
    private LocalDateTime lastCalculated = LocalDateTime.now();

    public enum ScoreCategory {
        POOR, FAIR, GOOD, VERY_GOOD, EXCEPTIONAL;

        public static ScoreCategory fromScore(int score) {
            if (score >= 800) return EXCEPTIONAL;
            if (score >= 740) return VERY_GOOD;
            if (score >= 670) return GOOD;
            if (score >= 580) return FAIR;
            return POOR;
        }

        public String getLabel() {
            return switch (this) {
                case POOR      -> "Poor";
                case FAIR      -> "Fair";
                case GOOD      -> "Good";
                case VERY_GOOD -> "Very Good";
                case EXCEPTIONAL -> "Exceptional";
            };
        }

        public String getColor() {
            return switch (this) {
                case POOR      -> "#d32f2f";
                case FAIR      -> "#f57c00";
                case GOOD      -> "#fbc02d";
                case VERY_GOOD -> "#388e3c";
                case EXCEPTIONAL -> "#1565c0";
            };
        }
    }
}
