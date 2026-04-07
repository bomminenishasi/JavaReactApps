package com.banking.transactions.service;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.transactions.dto.*;
import com.banking.transactions.entity.Transaction;
import com.banking.transactions.kafka.TransactionProducer;
import com.banking.transactions.repository.TransactionRepository;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionProducer transactionProducer;

    @Transactional
    public TransactionDTO transfer(String email, TransferRequest request) {
        Account from = getAccountOwnedBy(request.getFromAccountId(), email);
        Account to = accountRepository.findById(request.getToAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));

        if (from.getAccountId().equals(to.getAccountId())) {
            throw new BusinessException("Cannot transfer to the same account");
        }

        Transaction txn = transactionRepository.save(Transaction.builder()
            .fromAccount(from)
            .toAccount(to)
            .amount(request.getAmount())
            .txnType(Transaction.TransactionType.TRANSFER)
            .referenceNo(UUID.randomUUID().toString())
            .description(request.getDescription())
            .build());

        transactionProducer.sendTransactionInitiated(toEvent(txn));
        return toDTO(txn);
    }

    @Transactional
    public TransactionDTO deposit(String email, DepositWithdrawRequest request) {
        Account account = getAccountOwnedBy(request.getAccountId(), email);

        Transaction txn = transactionRepository.save(Transaction.builder()
            .toAccount(account)
            .amount(request.getAmount())
            .txnType(Transaction.TransactionType.DEPOSIT)
            .referenceNo(UUID.randomUUID().toString())
            .description(request.getDescription())
            .build());

        transactionProducer.sendTransactionInitiated(toEvent(txn));
        return toDTO(txn);
    }

    @Transactional
    public TransactionDTO withdraw(String email, DepositWithdrawRequest request) {
        Account account = getAccountOwnedBy(request.getAccountId(), email);

        Transaction txn = transactionRepository.save(Transaction.builder()
            .fromAccount(account)
            .amount(request.getAmount())
            .txnType(Transaction.TransactionType.WITHDRAWAL)
            .referenceNo(UUID.randomUUID().toString())
            .description(request.getDescription())
            .build());

        transactionProducer.sendTransactionInitiated(toEvent(txn));
        return toDTO(txn);
    }

    public Page<TransactionDTO> getTransactions(String email, Long accountId, Pageable pageable) {
        Account account = getAccountOwnedBy(accountId, email);
        return transactionRepository.findByAccount(account, pageable).map(this::toDTO);
    }

    private Account getAccountOwnedBy(Long accountId, String email) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        if (!account.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not own this account");
        }
        return account;
    }

    private TransactionEvent toEvent(Transaction txn) {
        return TransactionEvent.builder()
            .txnId(txn.getTxnId())
            .fromAccountId(txn.getFromAccount() != null ? txn.getFromAccount().getAccountId() : null)
            .toAccountId(txn.getToAccount() != null ? txn.getToAccount().getAccountId() : null)
            .amount(txn.getAmount())
            .txnType(txn.getTxnType().name())
            .referenceNo(txn.getReferenceNo())
            .build();
    }

    public TransactionDTO toDTO(Transaction txn) {
        TransactionDTO dto = new TransactionDTO();
        dto.setTxnId(txn.getTxnId());
        dto.setAmount(txn.getAmount());
        dto.setTxnType(txn.getTxnType().name());
        dto.setStatus(txn.getStatus().name());
        dto.setReferenceNo(txn.getReferenceNo());
        dto.setDescription(txn.getDescription());
        dto.setCreatedAt(txn.getCreatedAt());
        dto.setProcessedAt(txn.getProcessedAt());
        if (txn.getFromAccount() != null) {
            dto.setFromAccountId(txn.getFromAccount().getAccountId());
            dto.setFromAccountNumber(txn.getFromAccount().getAccountNumber());
        }
        if (txn.getToAccount() != null) {
            dto.setToAccountId(txn.getToAccount().getAccountId());
            dto.setToAccountNumber(txn.getToAccount().getAccountNumber());
        }
        return dto;
    }
}
