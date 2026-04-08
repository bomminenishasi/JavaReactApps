package com.banking.creditscore.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreditScoreDTO {
    private Long scoreId;
    private int score;
    private String category;       // e.g. "Very Good"
    private String categoryKey;    // enum name, e.g. "VERY_GOOD"
    private String color;          // hex color for UI gauge
    private int paymentHistoryPct;
    private int creditUtilizationPct;
    private int accountAgeMonths;
    private int creditMix;
    private LocalDateTime lastCalculated;

    // Derived display fields
    private int scoreMin;          // 300
    private int scoreMax;          // 850
    private double scorePercent;   // (score-300)/(850-300)*100
    private String tip;            // personalised improvement tip
}
