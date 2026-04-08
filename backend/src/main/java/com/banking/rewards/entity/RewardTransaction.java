package com.banking.rewards.entity;

import com.banking.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reward_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RewardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reward_txn_id")
    private Long rewardTxnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long points;

    @Column(name = "txn_type")
    @Enumerated(EnumType.STRING)
    private TxnType txnType;

    private String description;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TxnType { EARNED, REDEEMED, BONUS, EXPIRED }
}
