package com.banking.rewards.entity;

import com.banking.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rewards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rewards {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reward_id")
    private Long rewardId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "total_points")
    @Builder.Default
    private Long totalPoints = 0L;

    @Column(name = "lifetime_points")
    @Builder.Default
    private Long lifetimePoints = 0L;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RewardTier tier = RewardTier.BASIC;

    @Column(name = "last_updated")
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();

    public enum RewardTier {
        BASIC, SILVER, GOLD, PLATINUM;

        public static RewardTier fromPoints(long points) {
            if (points >= 50000) return PLATINUM;
            if (points >= 15000) return GOLD;
            if (points >= 5000) return SILVER;
            return BASIC;
        }

        public long getNextTierPoints() {
            return switch (this) {
                case BASIC -> 5000;
                case SILVER -> 15000;
                case GOLD -> 50000;
                case PLATINUM -> 50000;
            };
        }

        public String getColor() {
            return switch (this) {
                case BASIC -> "#9e9e9e";
                case SILVER -> "#78909c";
                case GOLD -> "#ffa000";
                case PLATINUM -> "#7b1fa2";
            };
        }
    }
}
