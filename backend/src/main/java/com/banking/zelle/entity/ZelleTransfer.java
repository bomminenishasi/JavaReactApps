package com.banking.zelle.entity;

import com.banking.accounts.entity.Account;
import com.banking.users.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "zelle_transfers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ZelleTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transfer_id")
    private Long transferId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id", nullable = false)
    private Account fromAccount;

    @Column(name = "recipient_email")
    private String recipientEmail;

    @Column(name = "recipient_phone")
    private String recipientPhone;

    @Column(name = "recipient_name")
    private String recipientName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    private String note;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TransferDirection direction = TransferDirection.SENT;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TransferStatus status = TransferStatus.COMPLETED;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TransferDirection { SENT, RECEIVED }

    public enum TransferStatus { PENDING, COMPLETED, FAILED, CANCELLED }
}
