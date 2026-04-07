package com.banking.payments.service;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.payments.dto.CreatePaymentRequest;
import com.banking.payments.dto.PaymentDTO;
import com.banking.payments.entity.Payment;
import com.banking.payments.repository.PaymentRepository;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public Page<PaymentDTO> getPayments(String email, Pageable pageable) {
        User user = getUser(email);
        return paymentRepository.findByUserOrderByCreatedAtDesc(user, pageable).map(this::toDTO);
    }

    @Transactional
    public PaymentDTO createPayment(String email, CreatePaymentRequest request) {
        User user = getUser(email);
        Account account = accountRepository.findById(request.getAccountId())
            .orElseThrow(() -> new ResourceNotFoundException("Account", request.getAccountId()));

        if (!account.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not own this account");
        }
        if (request.getScheduledDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Scheduled date cannot be in the past");
        }

        Payment payment = Payment.builder()
            .user(user)
            .account(account)
            .payeeName(request.getPayeeName())
            .amount(request.getAmount())
            .scheduledDate(request.getScheduledDate())
            .build();

        return toDTO(paymentRepository.save(payment));
    }

    @Transactional
    public void cancelPayment(Long paymentId, String email) {
        Payment payment = paymentRepository.findById(paymentId)
            .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));
        if (!payment.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("You do not own this payment");
        }
        if (payment.getStatus() != Payment.PaymentStatus.SCHEDULED) {
            throw new BusinessException("Only SCHEDULED payments can be cancelled");
        }
        payment.setStatus(Payment.PaymentStatus.CANCELLED);
        paymentRepository.save(payment);
    }

    @Scheduled(cron = "0 0 8 * * *")  // Run daily at 8 AM
    @Transactional
    public void processDuePayments() {
        List<Payment> duePayments = paymentRepository
            .findByStatusAndScheduledDateLessThanEqual(Payment.PaymentStatus.SCHEDULED, LocalDate.now());

        log.info("Processing {} due payments", duePayments.size());
        for (Payment payment : duePayments) {
            try {
                Account account = payment.getAccount();
                if (account.getBalance().compareTo(payment.getAmount()) >= 0) {
                    account.setBalance(account.getBalance().subtract(payment.getAmount()));
                    accountRepository.save(account);
                    payment.setStatus(Payment.PaymentStatus.COMPLETED);
                } else {
                    payment.setStatus(Payment.PaymentStatus.FAILED);
                    log.warn("Payment {} failed: insufficient balance", payment.getPaymentId());
                }
            } catch (Exception e) {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                log.error("Payment {} failed: {}", payment.getPaymentId(), e.getMessage());
            }
            paymentRepository.save(payment);
        }
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private PaymentDTO toDTO(Payment payment) {
        PaymentDTO dto = new PaymentDTO();
        dto.setPaymentId(payment.getPaymentId());
        dto.setAccountId(payment.getAccount().getAccountId());
        dto.setAccountNumber(payment.getAccount().getAccountNumber());
        dto.setPayeeName(payment.getPayeeName());
        dto.setAmount(payment.getAmount());
        dto.setScheduledDate(payment.getScheduledDate());
        dto.setStatus(payment.getStatus().name());
        dto.setCreatedAt(payment.getCreatedAt());
        return dto;
    }
}
