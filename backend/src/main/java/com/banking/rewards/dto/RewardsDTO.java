package com.banking.rewards.dto;

import lombok.Data;

@Data
public class RewardsDTO {
    private Long rewardId;
    private Long totalPoints;
    private Long lifetimePoints;
    private String tier;
    private String tierColor;
    private long nextTierPoints;
    private long pointsToNextTier;
    private double progressPercent;
    // Redemption values
    private double cashValue;       // $1 per 100 pts
    private double travelValue;     // $1.25 per 100 pts
    private double giftCardValue;   // $1 per 100 pts
}
