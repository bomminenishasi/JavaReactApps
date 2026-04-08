package com.banking.creditscore.service;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.creditcard.entity.CreditCard;
import com.banking.creditcard.repository.CreditCardRepository;
import com.banking.creditscore.dto.CreditScoreDTO;
import com.banking.creditscore.entity.CreditScore;
import com.banking.creditscore.repository.CreditScoreRepository;
import com.banking.transactions.entity.Transaction;
import com.banking.transactions.repository.TransactionRepository;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditScoreService {

    private final CreditScoreRepository creditScoreRepository;
    private final UserRepository         userRepository;
    private final AccountRepository      accountRepository;
    private final CreditCardRepository   creditCardRepository;
    private final TransactionRepository  transactionRepository;

    /**
     * Returns the credit score for the user, recalculating it fresh each time.
     */
    @Transactional
    public CreditScoreDTO getScore(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        CreditScore cs = creditScoreRepository.findByUser(user)
                .orElseGet(() -> CreditScore.builder().user(user).build());

        recalculate(cs, user);
        creditScoreRepository.save(cs);
        return toDTO(cs);
    }

    // ── Score calculation ────────────────────────────────────────────────────────

    private void recalculate(CreditScore cs, User user) {
        List<Account>     accounts = accountRepository.findByUserOrderByCreatedAtDesc(user);
        List<CreditCard>  cards    = creditCardRepository.findByUserOrderByCreatedAtDesc(user);

        // ── 1. Payment history (35 % of score weight) ────────────────────────
        int paymentPct = calcPaymentHistory(user, accounts);
        cs.setPaymentHistoryPct(paymentPct);

        // ── 2. Credit utilisation (30 %) ─────────────────────────────────────
        int utilPct = calcUtilization(cards);
        cs.setCreditUtilizationPct(utilPct);

        // ── 3. Account age (15 %) ─────────────────────────────────────────────
        int ageMonths = calcOldestAccountAge(accounts);
        cs.setAccountAgeMonths(ageMonths);

        // ── 4. Credit mix (10 %) ─────────────────────────────────────────────
        int mix = calcCreditMix(accounts, cards);
        cs.setCreditMix(mix);

        // ── Composite score (300 – 850) ───────────────────────────────────────
        int score = 580; // starting point for a new customer

        // Payment history (+/- up to 140 pts)
        score += Math.round((paymentPct / 100.0) * 140) - 20;   // perfect=+120, poor=-20

        // Credit utilisation (+/- up to 100 pts; lower util = higher score)
        if (utilPct == 0)        score += 100;
        else if (utilPct <= 10)  score += 80;
        else if (utilPct <= 30)  score += 50;
        else if (utilPct <= 50)  score += 10;
        else if (utilPct <= 75)  score -= 30;
        else                     score -= 80;

        // Account age (+up to 90 pts, +10 per year capped at 9 yrs)
        score += Math.min(90, (ageMonths / 12) * 10);

        // Credit mix (+0/+20/+40)
        score += mix * 20;

        // Balance health: +15 if any account > $500
        boolean hasBalance = accounts.stream()
                .anyMatch(a -> a.getBalance().compareTo(new BigDecimal("500")) > 0);
        if (hasBalance) score += 15;

        // Clamp to FICO range
        score = Math.max(300, Math.min(850, score));

        cs.setScore(score);
        cs.setCategory(CreditScore.ScoreCategory.fromScore(score));
        cs.setLastCalculated(LocalDateTime.now());
    }

    private int calcPaymentHistory(User user, List<Account> accounts) {
        if (accounts.isEmpty()) return 100; // no history = assume perfect

        long total  = 0;
        long failed = 0;
        for (Account a : accounts) {
            List<Transaction> txns = transactionRepository.findAllByAccount(a);
            total  += txns.size();
            failed += txns.stream()
                    .filter(t -> t.getStatus() == Transaction.TransactionStatus.FAILED)
                    .count();
        }
        if (total == 0) return 100;
        return (int) Math.round(((total - failed) / (double) total) * 100);
    }

    private int calcUtilization(List<CreditCard> cards) {
        if (cards.isEmpty()) return 0;
        BigDecimal totalLimit   = BigDecimal.ZERO;
        BigDecimal totalBalance = BigDecimal.ZERO;
        for (CreditCard c : cards) {
            if (c.getCreditLimit().compareTo(BigDecimal.ZERO) > 0) {
                totalLimit   = totalLimit.add(c.getCreditLimit());
                totalBalance = totalBalance.add(c.getCurrentBalance());
            }
        }
        if (totalLimit.compareTo(BigDecimal.ZERO) == 0) return 0;
        return (int) Math.round(totalBalance.divide(totalLimit, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100")).doubleValue());
    }

    private int calcOldestAccountAge(List<Account> accounts) {
        return accounts.stream()
                .map(a -> (int) ChronoUnit.MONTHS.between(a.getCreatedAt(), LocalDateTime.now()))
                .max(Integer::compareTo)
                .orElse(0);
    }

    private int calcCreditMix(List<Account> accounts, List<CreditCard> cards) {
        boolean hasSavings  = accounts.stream().anyMatch(a -> a.getAccountType() == Account.AccountType.SAVINGS);
        boolean hasChecking = accounts.stream().anyMatch(a -> a.getAccountType() == Account.AccountType.CHECKING);
        boolean hasCard     = !cards.isEmpty();
        int mix = 0;
        if (hasSavings || hasChecking) mix++;
        if ((hasSavings && hasChecking) || hasCard) mix++;
        return mix;
    }

    // ── DTO mapping ──────────────────────────────────────────────────────────────

    private CreditScoreDTO toDTO(CreditScore cs) {
        CreditScoreDTO dto = new CreditScoreDTO();
        dto.setScoreId(cs.getScoreId());
        dto.setScore(cs.getScore());
        dto.setCategory(cs.getCategory().getLabel());
        dto.setCategoryKey(cs.getCategory().name());
        dto.setColor(cs.getCategory().getColor());
        dto.setPaymentHistoryPct(cs.getPaymentHistoryPct());
        dto.setCreditUtilizationPct(cs.getCreditUtilizationPct());
        dto.setAccountAgeMonths(cs.getAccountAgeMonths());
        dto.setCreditMix(cs.getCreditMix());
        dto.setLastCalculated(cs.getLastCalculated());
        dto.setScoreMin(300);
        dto.setScoreMax(850);
        dto.setScorePercent(Math.round((cs.getScore() - 300.0) / (850.0 - 300.0) * 1000) / 10.0);
        dto.setTip(buildTip(cs));
        return dto;
    }

    private String buildTip(CreditScore cs) {
        if (cs.getCreditUtilizationPct() > 50)
            return "Pay down credit card balances to below 30% of your limit to boost your score.";
        if (cs.getPaymentHistoryPct() < 95)
            return "Avoid missed or late payments — payment history is the biggest factor.";
        if (cs.getAccountAgeMonths() < 12)
            return "Keep your accounts open; a longer credit history improves your score over time.";
        if (cs.getCreditMix() < 2)
            return "A healthy mix of account types (savings, checking, credit card) can improve your score.";
        if (cs.getScore() >= 740)
            return "Excellent credit! You qualify for the best rates. Keep it up.";
        return "Continue making on-time payments and keeping balances low to improve your score.";
    }
}
