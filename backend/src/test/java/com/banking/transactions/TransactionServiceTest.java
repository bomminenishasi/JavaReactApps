package com.banking.transactions;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.transactions.dto.DepositWithdrawRequest;
import com.banking.transactions.dto.TransactionDTO;
import com.banking.transactions.dto.TransferRequest;
import com.banking.transactions.entity.Transaction;
import com.banking.transactions.kafka.TransactionProducer;
import com.banking.transactions.repository.TransactionRepository;
import com.banking.transactions.service.TransactionService;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionService Unit Tests")
class TransactionServiceTest {

    @Mock TransactionRepository transactionRepository;
    @Mock AccountRepository     accountRepository;
    @Mock UserRepository        userRepository;
    @Mock TransactionProducer   transactionProducer;

    @InjectMocks TransactionService transactionService;

    private User owner;
    private User other;
    private Account fromAccount;
    private Account toAccount;

    @BeforeEach
    void setUp() {
        owner = User.builder().email("owner@example.com").build();
        other = User.builder().email("other@example.com").build();

        fromAccount = Account.builder()
                .accountId(1L).user(owner)
                .accountNumber("ACC-001")
                .balance(BigDecimal.valueOf(2000))
                .status(Account.AccountStatus.ACTIVE)
                .build();

        toAccount = Account.builder()
                .accountId(2L).user(other)
                .accountNumber("ACC-002")
                .balance(BigDecimal.valueOf(500))
                .status(Account.AccountStatus.ACTIVE)
                .build();
    }

    // ── transfer ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("transfer: valid transfer saves transaction and fires Kafka event")
    void transfer_valid_savesAndFiresEvent() {
        TransferRequest req = new TransferRequest();
        req.setFromAccountId(1L);
        req.setToAccountId(2L);
        req.setAmount(BigDecimal.valueOf(100));
        req.setDescription("Rent");

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findById(2L)).thenReturn(Optional.of(toAccount));

        Transaction saved = Transaction.builder()
                .txnId(10L).fromAccount(fromAccount).toAccount(toAccount)
                .amount(BigDecimal.valueOf(100))
                .txnType(Transaction.TransactionType.TRANSFER)
                .status(Transaction.TransactionStatus.PENDING)
                .referenceNo("ref-123").build();
        when(transactionRepository.save(any())).thenReturn(saved);

        TransactionDTO dto = transactionService.transfer("owner@example.com", req);

        assertThat(dto.getTxnId()).isEqualTo(10L);
        assertThat(dto.getTxnType()).isEqualTo("TRANSFER");
        verify(transactionProducer).sendTransactionInitiated(any());
    }

    @Test
    @DisplayName("transfer: same source and destination throws BusinessException")
    void transfer_sameAccount_throws() {
        TransferRequest req = new TransferRequest();
        req.setFromAccountId(1L);
        req.setToAccountId(1L);
        req.setAmount(BigDecimal.valueOf(100));

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));

        assertThatThrownBy(() -> transactionService.transfer("owner@example.com", req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("same account");
    }

    @Test
    @DisplayName("transfer: non-owner of source account throws AccessDeniedException")
    void transfer_nonOwner_throwsAccessDenied() {
        TransferRequest req = new TransferRequest();
        req.setFromAccountId(1L);
        req.setToAccountId(2L);
        req.setAmount(BigDecimal.valueOf(50));

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));

        assertThatThrownBy(() -> transactionService.transfer("attacker@example.com", req))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("transfer: destination account not found throws ResourceNotFoundException")
    void transfer_destinationMissing_throws() {
        TransferRequest req = new TransferRequest();
        req.setFromAccountId(1L);
        req.setToAccountId(99L);
        req.setAmount(BigDecimal.valueOf(50));

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.transfer("owner@example.com", req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── deposit ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("deposit: valid deposit saves transaction and fires Kafka event")
    void deposit_valid_savesAndFiresEvent() {
        DepositWithdrawRequest req = new DepositWithdrawRequest();
        req.setAccountId(1L);
        req.setAmount(BigDecimal.valueOf(500));

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));

        Transaction saved = Transaction.builder()
                .txnId(11L).toAccount(fromAccount)
                .amount(BigDecimal.valueOf(500))
                .txnType(Transaction.TransactionType.DEPOSIT)
                .status(Transaction.TransactionStatus.PENDING)
                .referenceNo("dep-ref").build();
        when(transactionRepository.save(any())).thenReturn(saved);

        TransactionDTO dto = transactionService.deposit("owner@example.com", req);

        assertThat(dto.getTxnType()).isEqualTo("DEPOSIT");
        verify(transactionProducer).sendTransactionInitiated(any());
    }

    @Test
    @DisplayName("deposit: non-owner throws AccessDeniedException")
    void deposit_nonOwner_throwsAccessDenied() {
        DepositWithdrawRequest req = new DepositWithdrawRequest();
        req.setAccountId(1L);
        req.setAmount(BigDecimal.valueOf(500));

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));

        assertThatThrownBy(() -> transactionService.deposit("other@example.com", req))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── withdraw ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("withdraw: valid withdrawal saves transaction and fires Kafka event")
    void withdraw_valid_savesAndFiresEvent() {
        DepositWithdrawRequest req = new DepositWithdrawRequest();
        req.setAccountId(1L);
        req.setAmount(BigDecimal.valueOf(200));

        when(accountRepository.findById(1L)).thenReturn(Optional.of(fromAccount));

        Transaction saved = Transaction.builder()
                .txnId(12L).fromAccount(fromAccount)
                .amount(BigDecimal.valueOf(200))
                .txnType(Transaction.TransactionType.WITHDRAWAL)
                .status(Transaction.TransactionStatus.PENDING)
                .referenceNo("wdw-ref").build();
        when(transactionRepository.save(any())).thenReturn(saved);

        TransactionDTO dto = transactionService.withdraw("owner@example.com", req);

        assertThat(dto.getTxnType()).isEqualTo("WITHDRAWAL");
        verify(transactionProducer).sendTransactionInitiated(any());
    }

    @Test
    @DisplayName("withdraw: account not found throws ResourceNotFoundException")
    void withdraw_accountMissing_throws() {
        DepositWithdrawRequest req = new DepositWithdrawRequest();
        req.setAccountId(99L);
        req.setAmount(BigDecimal.valueOf(100));

        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> transactionService.withdraw("owner@example.com", req))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
