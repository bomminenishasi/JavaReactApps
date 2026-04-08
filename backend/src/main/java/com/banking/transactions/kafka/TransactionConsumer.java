package com.banking.transactions.kafka;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.config.KafkaConfig;
import com.banking.transactions.dto.TransactionEvent;
import com.banking.transactions.entity.Transaction;
import com.banking.transactions.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionConsumer {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final TransactionProducer transactionProducer;

    @KafkaListener(topics = KafkaConfig.TOPIC_TXN_INITIATED, groupId = "banking-group")
    @Transactional
    public void processTransaction(TransactionEvent event) {
        log.info("Processing transaction: {}", event.getReferenceNo());

        Transaction txn = transactionRepository.findByReferenceNo(event.getReferenceNo())
            .orElseGet(() -> {
                log.warn("Transaction not found for ref: {}", event.getReferenceNo());
                return null;
            });

        if (txn == null) return;

        try {
            switch (Transaction.TransactionType.valueOf(event.getTxnType())) {
                case TRANSFER -> processTransfer(event, txn);
                case DEPOSIT  -> processDeposit(event, txn);
                case WITHDRAWAL -> processWithdrawal(event, txn);
                default -> log.warn("Unknown transaction type: {}", event.getTxnType());
            }

            txn.setStatus(Transaction.TransactionStatus.SUCCESS);
            txn.setProcessedAt(LocalDateTime.now());
            transactionRepository.save(txn);
            transactionProducer.sendTransactionCompleted(event);

        } catch (Exception e) {
            log.error("Transaction processing failed: {}", e.getMessage());
            txn.setStatus(Transaction.TransactionStatus.FAILED);
            txn.setProcessedAt(LocalDateTime.now());
            transactionRepository.save(txn);
            transactionProducer.sendTransactionFailed(event);
        }
    }

    private void processTransfer(TransactionEvent event, Transaction txn) {
        Account from = accountRepository.findWithLockByAccountId(event.getFromAccountId())
            .orElseThrow(() -> new BusinessException("Source account not found"));
        Account to = accountRepository.findWithLockByAccountId(event.getToAccountId())
            .orElseThrow(() -> new BusinessException("Destination account not found"));

        if (from.getBalance().compareTo(event.getAmount()) < 0) {
            throw new BusinessException("Insufficient balance");
        }
        from.setBalance(from.getBalance().subtract(event.getAmount()));
        to.setBalance(to.getBalance().add(event.getAmount()));
        accountRepository.save(from);
        accountRepository.save(to);
    }

    private void processDeposit(TransactionEvent event, Transaction txn) {
        Account to = accountRepository.findWithLockByAccountId(event.getToAccountId())
            .orElseThrow(() -> new BusinessException("Account not found"));
        to.setBalance(to.getBalance().add(event.getAmount()));
        accountRepository.save(to);
    }

    private void processWithdrawal(TransactionEvent event, Transaction txn) {
        Account from = accountRepository.findWithLockByAccountId(event.getFromAccountId())
            .orElseThrow(() -> new BusinessException("Account not found"));
        if (from.getBalance().compareTo(event.getAmount()) < 0) {
            throw new BusinessException("Insufficient balance");
        }
        from.setBalance(from.getBalance().subtract(event.getAmount()));
        accountRepository.save(from);
    }
}
