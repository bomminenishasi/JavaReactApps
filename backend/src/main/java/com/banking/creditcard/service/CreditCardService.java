package com.banking.creditcard.service;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.creditcard.dto.ApplyCardRequest;
import com.banking.creditcard.dto.CardPaymentRequest;
import com.banking.creditcard.dto.CreditCardDTO;
import com.banking.creditcard.entity.CreditCard;
import com.banking.creditcard.repository.CreditCardRepository;
import com.banking.rewards.service.RewardsService;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreditCardService {

    private final CreditCardRepository creditCardRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final RewardsService rewardsService;

    public List<CreditCardDTO> getUserCards(String email) {
        User user = getUser(email);
        return creditCardRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public CreditCardDTO applyForCard(String email, ApplyCardRequest request) {
        User user = getUser(email);
        CreditCard.CardType cardType = CreditCard.CardType.valueOf(request.getCardType().toUpperCase());
        BigDecimal limit = cardType.getCreditLimit();

        CreditCard card = CreditCard.builder()
                .user(user)
                .cardNumber(generateCardNumber())
                .cardType(cardType)
                .creditLimit(limit)
                .availableCredit(limit)
                .dueDate(LocalDate.now().plusDays(30))
                .minimumPayment(new BigDecimal("25.00"))
                .build();

        return toDTO(creditCardRepository.save(card));
    }

    @Transactional
    public CreditCardDTO makePayment(String email, Long cardId, CardPaymentRequest request) {
        User user = getUser(email);
        CreditCard card = creditCardRepository.findByCardIdAndUser(cardId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));
        Account account = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (account.getBalance().compareTo(request.getAmount()) < 0)
            throw new BusinessException("Insufficient balance in account");
        if (request.getAmount().compareTo(card.getCurrentBalance()) > 0)
            throw new BusinessException("Payment exceeds current balance");

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        card.setCurrentBalance(card.getCurrentBalance().subtract(request.getAmount()));
        card.setAvailableCredit(card.getCreditLimit().subtract(card.getCurrentBalance()));

        accountRepository.save(account);
        return toDTO(creditCardRepository.save(card));
    }

    @Transactional
    public CreditCardDTO simulatePurchase(String email, Long cardId, BigDecimal amount, String description) {
        User user = getUser(email);
        CreditCard card = creditCardRepository.findByCardIdAndUser(cardId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found"));

        if (card.getAvailableCredit().compareTo(amount) < 0)
            throw new BusinessException("Insufficient available credit");

        card.setCurrentBalance(card.getCurrentBalance().add(amount));
        card.setAvailableCredit(card.getCreditLimit().subtract(card.getCurrentBalance()));

        long pointsEarned = (long) (amount.doubleValue() * card.getCardType().getRewardMultiplier());
        card.setRewardPoints(card.getRewardPoints() + pointsEarned);

        rewardsService.addPoints(user, pointsEarned, "Credit card purchase: " + description, null);

        return toDTO(creditCardRepository.save(card));
    }

    private String generateCardNumber() {
        Random rnd = new Random();
        String num;
        do {
            num = String.format("4%015d", (long)(rnd.nextDouble() * 1_000_000_000_000_000L));
        } while (creditCardRepository.existsByCardNumber(num));
        return num;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    public CreditCardDTO toDTO(CreditCard card) {
        CreditCardDTO dto = new CreditCardDTO();
        dto.setCardId(card.getCardId());
        dto.setCardNumber(card.getCardNumber());
        dto.setMaskedNumber("**** **** **** " + card.getCardNumber().substring(card.getCardNumber().length() - 4));
        dto.setCardType(card.getCardType().name());
        dto.setCreditLimit(card.getCreditLimit());
        dto.setCurrentBalance(card.getCurrentBalance());
        dto.setAvailableCredit(card.getAvailableCredit());
        dto.setDueDate(card.getDueDate());
        dto.setMinimumPayment(card.getMinimumPayment());
        dto.setStatus(card.getStatus().name());
        dto.setRewardPoints(card.getRewardPoints());
        dto.setCreatedAt(card.getCreatedAt());
        dto.setRewardMultiplier(card.getCardType().getRewardMultiplier());
        return dto;
    }
}
