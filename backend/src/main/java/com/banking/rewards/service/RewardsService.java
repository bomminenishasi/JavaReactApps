package com.banking.rewards.service;

import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.rewards.dto.RedeemRequest;
import com.banking.rewards.dto.RewardTransactionDTO;
import com.banking.rewards.dto.RewardsDTO;
import com.banking.rewards.entity.RewardTransaction;
import com.banking.rewards.entity.Rewards;
import com.banking.rewards.repository.RewardTransactionRepository;
import com.banking.rewards.repository.RewardsRepository;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RewardsService {

    private final RewardsRepository rewardsRepository;
    private final RewardTransactionRepository rewardTransactionRepository;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;

    public RewardsDTO getSummary(String email) {
        User user = getUser(email);
        Rewards rewards = getOrCreate(user);
        return toDTO(rewards);
    }

    public Page<RewardTransactionDTO> getHistory(String email, Pageable pageable) {
        User user = getUser(email);
        return rewardTransactionRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::toTxnDTO);
    }

    @Transactional
    public RewardsDTO addPoints(User user, long points, String description, String referenceId) {
        Rewards rewards = getOrCreate(user);
        rewards.setTotalPoints(rewards.getTotalPoints() + points);
        rewards.setLifetimePoints(rewards.getLifetimePoints() + points);
        rewards.setTier(Rewards.RewardTier.fromPoints(rewards.getLifetimePoints()));
        rewards.setLastUpdated(LocalDateTime.now());
        rewardsRepository.save(rewards);

        rewardTransactionRepository.save(RewardTransaction.builder()
                .user(user).points(points)
                .txnType(RewardTransaction.TxnType.EARNED)
                .description(description).referenceId(referenceId).build());

        return toDTO(rewards);
    }

    @Transactional
    public RewardsDTO redeem(String email, RedeemRequest req) {
        User user = getUser(email);
        Rewards rewards = getOrCreate(user);

        if (rewards.getTotalPoints() < req.getPoints())
            throw new BusinessException("Insufficient points");

        rewards.setTotalPoints(rewards.getTotalPoints() - req.getPoints());
        rewards.setLastUpdated(LocalDateTime.now());
        rewardsRepository.save(rewards);

        String desc = "Redeemed " + req.getPoints() + " points for " + req.getRedeemType();

        if ("CASH".equals(req.getRedeemType()) && req.getToAccountId() != null) {
            var account = accountRepository.findById(req.getToAccountId())
                    .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
            BigDecimal cashAmount = new BigDecimal(req.getPoints()).divide(new BigDecimal("100"));
            account.setBalance(account.getBalance().add(cashAmount));
            accountRepository.save(account);
            desc += " ($" + cashAmount + " deposited)";
        }

        rewardTransactionRepository.save(RewardTransaction.builder()
                .user(user).points(-req.getPoints())
                .txnType(RewardTransaction.TxnType.REDEEMED)
                .description(desc).build());

        return toDTO(rewards);
    }

    public Rewards getOrCreate(User user) {
        return rewardsRepository.findByUser(user).orElseGet(() -> {
            Rewards r = Rewards.builder().user(user).build();
            return rewardsRepository.save(r);
        });
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private RewardsDTO toDTO(Rewards r) {
        RewardsDTO dto = new RewardsDTO();
        dto.setRewardId(r.getRewardId());
        dto.setTotalPoints(r.getTotalPoints());
        dto.setLifetimePoints(r.getLifetimePoints());
        dto.setTier(r.getTier().name());
        dto.setTierColor(r.getTier().getColor());
        long next = r.getTier().getNextTierPoints();
        dto.setNextTierPoints(next);
        dto.setPointsToNextTier(Math.max(0, next - r.getLifetimePoints()));
        dto.setProgressPercent(r.getTier() == Rewards.RewardTier.PLATINUM ? 100.0
                : Math.min(100.0, (r.getLifetimePoints() * 100.0) / next));
        dto.setCashValue(r.getTotalPoints() / 100.0);
        dto.setTravelValue(r.getTotalPoints() / 80.0);
        dto.setGiftCardValue(r.getTotalPoints() / 100.0);
        return dto;
    }

    private RewardTransactionDTO toTxnDTO(RewardTransaction t) {
        RewardTransactionDTO dto = new RewardTransactionDTO();
        dto.setRewardTxnId(t.getRewardTxnId());
        dto.setPoints(t.getPoints());
        dto.setTxnType(t.getTxnType().name());
        dto.setDescription(t.getDescription());
        dto.setReferenceId(t.getReferenceId());
        dto.setCreatedAt(t.getCreatedAt());
        return dto;
    }
}
