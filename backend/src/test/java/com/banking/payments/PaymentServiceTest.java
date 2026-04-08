package com.banking.payments;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.payments.dto.CreatePaymentRequest;
import com.banking.payments.dto.PaymentDTO;
import com.banking.payments.entity.Payment;
import com.banking.payments.repository.PaymentRepository;
import com.banking.payments.service.PaymentService;
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
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService Unit Tests")
class PaymentServiceTest {

    @Mock PaymentRepository paymentRepository;
    @Mock AccountRepository accountRepository;
    @Mock UserRepository    userRepository;

    @InjectMocks PaymentService paymentService;

    private User testUser;
    private Account testAccount;
    private Payment scheduledPayment;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("john@example.com")
                .firstName("John").lastName("Doe")
                .build();

        testAccount = Account.builder()
                .accountId(1L).user(testUser)
                .accountNumber("SAV-001")
                .balance(BigDecimal.valueOf(3000))
                .status(Account.AccountStatus.ACTIVE)
                .build();

        scheduledPayment = Payment.builder()
                .paymentId(10L)
                .user(testUser)
                .account(testAccount)
                .payeeName("Electric Company")
                .amount(BigDecimal.valueOf(150))
                .scheduledDate(LocalDate.now().plusDays(3))
                .status(Payment.PaymentStatus.SCHEDULED)
                .build();
    }

    // ── createPayment ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("createPayment: future date saves and returns DTO")
    void createPayment_futureDate_success() {
        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setAccountId(1L);
        req.setPayeeName("Electric Company");
        req.setAmount(BigDecimal.valueOf(150));
        req.setScheduledDate(LocalDate.now().plusDays(5));

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));
        when(paymentRepository.save(any(Payment.class))).thenReturn(scheduledPayment);

        PaymentDTO dto = paymentService.createPayment("john@example.com", req);

        assertThat(dto.getPayeeName()).isEqualTo("Electric Company");
        assertThat(dto.getStatus()).isEqualTo("SCHEDULED");
        verify(paymentRepository).save(any(Payment.class));
    }

    @Test
    @DisplayName("createPayment: past date throws BusinessException")
    void createPayment_pastDate_throws() {
        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setAccountId(1L);
        req.setPayeeName("Gas Company");
        req.setAmount(BigDecimal.valueOf(80));
        req.setScheduledDate(LocalDate.now().minusDays(1));

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        assertThatThrownBy(() -> paymentService.createPayment("john@example.com", req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("past");
    }

    @Test
    @DisplayName("createPayment: non-owner of account throws AccessDeniedException")
    void createPayment_nonOwner_throwsAccessDenied() {
        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setAccountId(1L);
        req.setPayeeName("Netflix");
        req.setAmount(BigDecimal.valueOf(15));
        req.setScheduledDate(LocalDate.now().plusDays(1));

        User otherUser = User.builder().email("hacker@example.com").build();
        when(userRepository.findByEmail("hacker@example.com")).thenReturn(Optional.of(otherUser));
        when(accountRepository.findById(1L)).thenReturn(Optional.of(testAccount));

        assertThatThrownBy(() -> paymentService.createPayment("hacker@example.com", req))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("createPayment: missing account throws ResourceNotFoundException")
    void createPayment_missingAccount_throws() {
        CreatePaymentRequest req = new CreatePaymentRequest();
        req.setAccountId(99L);
        req.setPayeeName("Gym");
        req.setAmount(BigDecimal.valueOf(50));
        req.setScheduledDate(LocalDate.now().plusDays(2));

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.createPayment("john@example.com", req))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── cancelPayment ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("cancelPayment: SCHEDULED payment cancels successfully")
    void cancelPayment_scheduled_success() {
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(scheduledPayment));
        when(paymentRepository.save(any())).thenReturn(scheduledPayment);

        paymentService.cancelPayment(10L, "john@example.com");

        assertThat(scheduledPayment.getStatus()).isEqualTo(Payment.PaymentStatus.CANCELLED);
        verify(paymentRepository).save(scheduledPayment);
    }

    @Test
    @DisplayName("cancelPayment: COMPLETED payment throws BusinessException")
    void cancelPayment_completed_throws() {
        scheduledPayment.setStatus(Payment.PaymentStatus.COMPLETED);
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(scheduledPayment));

        assertThatThrownBy(() -> paymentService.cancelPayment(10L, "john@example.com"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("SCHEDULED");
    }

    @Test
    @DisplayName("cancelPayment: non-owner throws AccessDeniedException")
    void cancelPayment_nonOwner_throwsAccessDenied() {
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(scheduledPayment));

        assertThatThrownBy(() -> paymentService.cancelPayment(10L, "other@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("cancelPayment: missing payment throws ResourceNotFoundException")
    void cancelPayment_missing_throws() {
        when(paymentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.cancelPayment(99L, "john@example.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── processDuePayments ────────────────────────────────────────────────────

    @Test
    @DisplayName("processDuePayments: sufficient balance completes payment and debits account")
    void processDuePayments_sufficientBalance_completesPayment() {
        scheduledPayment.setScheduledDate(LocalDate.now());
        when(paymentRepository.findByStatusAndScheduledDateLessThanEqual(
                Payment.PaymentStatus.SCHEDULED, LocalDate.now()))
                .thenReturn(List.of(scheduledPayment));
        when(accountRepository.save(any())).thenReturn(testAccount);
        when(paymentRepository.save(any())).thenReturn(scheduledPayment);

        paymentService.processDuePayments();

        assertThat(scheduledPayment.getStatus()).isEqualTo(Payment.PaymentStatus.COMPLETED);
        assertThat(testAccount.getBalance())
                .isEqualByComparingTo(BigDecimal.valueOf(3000).subtract(BigDecimal.valueOf(150)));
    }

    @Test
    @DisplayName("processDuePayments: insufficient balance marks payment FAILED")
    void processDuePayments_insufficientBalance_failsPayment() {
        testAccount.setBalance(BigDecimal.valueOf(10)); // less than payment amount 150
        scheduledPayment.setScheduledDate(LocalDate.now());

        when(paymentRepository.findByStatusAndScheduledDateLessThanEqual(
                Payment.PaymentStatus.SCHEDULED, LocalDate.now()))
                .thenReturn(List.of(scheduledPayment));
        when(paymentRepository.save(any())).thenReturn(scheduledPayment);

        paymentService.processDuePayments();

        assertThat(scheduledPayment.getStatus()).isEqualTo(Payment.PaymentStatus.FAILED);
    }
}
