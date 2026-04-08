package com.banking.creditscore;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.creditcard.entity.CreditCard;
import com.banking.creditcard.repository.CreditCardRepository;
import com.banking.creditscore.dto.CreditScoreDTO;
import com.banking.creditscore.entity.CreditScore;
import com.banking.creditscore.repository.CreditScoreRepository;
import com.banking.creditscore.service.CreditScoreService;
import com.banking.transactions.entity.Transaction;
import com.banking.transactions.repository.TransactionRepository;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CreditScoreService Unit Tests")
class CreditScoreServiceTest {

    @Mock CreditScoreRepository creditScoreRepository;
    @Mock UserRepository        userRepository;
    @Mock AccountRepository     accountRepository;
    @Mock CreditCardRepository  creditCardRepository;
    @Mock TransactionRepository transactionRepository;

    @InjectMocks CreditScoreService creditScoreService;

    private User testUser;
    private Account savingsAccount;
    private Account checkingAccount;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("john@example.com")
                .firstName("John")
                .lastName("Doe")
                .build();

        savingsAccount = Account.builder()
                .accountId(1L)
                .accountType(Account.AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(1500))
                .createdAt(LocalDateTime.now().minusMonths(24))
                .build();

        checkingAccount = Account.builder()
                .accountId(2L)
                .accountType(Account.AccountType.CHECKING)
                .balance(BigDecimal.valueOf(600))
                .createdAt(LocalDateTime.now().minusMonths(12))
                .build();
    }

    // ── getScore ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getScore: unknown user throws UsernameNotFoundException")
    void getScore_unknownUser_throws() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> creditScoreService.getScore("nobody@example.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    @DisplayName("getScore: new user with no accounts gets base score in FAIR range")
    void getScore_newUser_noAccounts_baseFairScore() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(creditScoreRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(accountRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(creditCardRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(creditScoreRepository.save(any(CreditScore.class))).thenAnswer(i -> i.getArgument(0));

        CreditScoreDTO dto = creditScoreService.getScore("john@example.com");

        assertThat(dto.getScore()).isBetween(300, 850);
        assertThat(dto.getScoreMin()).isEqualTo(300);
        assertThat(dto.getScoreMax()).isEqualTo(850);
        assertThat(dto.getCategory()).isNotBlank();
        assertThat(dto.getTip()).isNotBlank();
        assertThat(dto.getScorePercent()).isBetween(0.0, 100.0);
    }

    @Test
    @DisplayName("getScore: user with savings+checking+no-failed-txns gets GOOD or better score")
    void getScore_healthyUser_goodOrBetterScore() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(creditScoreRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(accountRepository.findByUserOrderByCreatedAtDesc(testUser))
                .thenReturn(List.of(savingsAccount, checkingAccount));
        when(creditCardRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        // All transactions successful
        Transaction successTxn = Transaction.builder()
                .status(Transaction.TransactionStatus.SUCCESS)
                .build();
        when(transactionRepository.findAllByAccount(any(Account.class)))
                .thenReturn(List.of(successTxn, successTxn, successTxn));
        when(creditScoreRepository.save(any(CreditScore.class))).thenAnswer(i -> i.getArgument(0));

        CreditScoreDTO dto = creditScoreService.getScore("john@example.com");

        assertThat(dto.getScore()).isGreaterThanOrEqualTo(670); // GOOD threshold
        assertThat(dto.getPaymentHistoryPct()).isEqualTo(100);
        assertThat(dto.getCreditMix()).isGreaterThanOrEqualTo(1);
    }

    @Test
    @DisplayName("getScore: high credit utilization lowers score")
    void getScore_highCreditUtilization_lowersScore() {
        CreditCard highUtilCard = CreditCard.builder()
                .creditLimit(BigDecimal.valueOf(10000))
                .currentBalance(BigDecimal.valueOf(9000)) // 90% utilization
                .status(CreditCard.CardStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(creditScoreRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(accountRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(creditCardRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(List.of(highUtilCard));
        when(creditScoreRepository.save(any(CreditScore.class))).thenAnswer(i -> i.getArgument(0));

        CreditScoreDTO dto = creditScoreService.getScore("john@example.com");

        assertThat(dto.getCreditUtilizationPct()).isGreaterThan(50);
        assertThat(dto.getScore()).isLessThan(700); // High util should reduce score
    }

    @Test
    @DisplayName("getScore: failed transactions lower payment history pct")
    void getScore_failedTransactions_lowerPaymentHistory() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(creditScoreRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(accountRepository.findByUserOrderByCreatedAtDesc(testUser))
                .thenReturn(List.of(savingsAccount));
        when(creditCardRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());

        Transaction failedTxn = Transaction.builder()
                .status(Transaction.TransactionStatus.FAILED).build();
        Transaction successTxn = Transaction.builder()
                .status(Transaction.TransactionStatus.SUCCESS).build();
        // 5 out of 10 failed = 50% payment history
        when(transactionRepository.findAllByAccount(savingsAccount))
                .thenReturn(List.of(failedTxn, failedTxn, failedTxn, failedTxn, failedTxn,
                        successTxn, successTxn, successTxn, successTxn, successTxn));
        when(creditScoreRepository.save(any(CreditScore.class))).thenAnswer(i -> i.getArgument(0));

        CreditScoreDTO dto = creditScoreService.getScore("john@example.com");

        assertThat(dto.getPaymentHistoryPct()).isEqualTo(50);
    }

    @Test
    @DisplayName("getScore: existing CreditScore record is updated, not duplicated")
    void getScore_existingRecord_isUpdated() {
        CreditScore existing = CreditScore.builder().user(testUser).score(600).build();

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(creditScoreRepository.findByUser(testUser)).thenReturn(Optional.of(existing));
        when(accountRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(creditCardRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(creditScoreRepository.save(any(CreditScore.class))).thenAnswer(i -> i.getArgument(0));

        creditScoreService.getScore("john@example.com");

        // Should save (update) the existing record, not create a new one
        verify(creditScoreRepository, times(1)).save(existing);
    }

    @Test
    @DisplayName("getScore: score is clamped between 300 and 850")
    void getScore_alwaysClamped() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(creditScoreRepository.findByUser(testUser)).thenReturn(Optional.empty());
        when(accountRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(creditCardRepository.findByUserOrderByCreatedAtDesc(testUser)).thenReturn(Collections.emptyList());
        when(creditScoreRepository.save(any(CreditScore.class))).thenAnswer(i -> i.getArgument(0));

        CreditScoreDTO dto = creditScoreService.getScore("john@example.com");

        assertThat(dto.getScore()).isBetween(300, 850);
    }
}
