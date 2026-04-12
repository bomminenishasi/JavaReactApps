package com.shopease.payment.service;

import com.shopease.payment.entity.Payment;
import com.shopease.payment.entity.PaymentStatus;
import com.shopease.payment.kafka.PaymentEventProducer;
import com.shopease.payment.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentEventProducer eventProducer;

    @Transactional
    public Payment processPayment(Long orderId, Long userId, Double amount, String method) {
        Payment payment = Payment.builder()
            .orderId(orderId).userId(userId)
            .amount(amount).paymentMethod(method)
            .transactionId("TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .status(PaymentStatus.CAPTURED)
            .build();

        payment = paymentRepository.save(payment);
        eventProducer.publishPaymentCaptured(payment);
        log.info("Payment captured: orderId={}, txn={}", orderId, payment.getTransactionId());
        return payment;
    }

    public Payment getPaymentByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Payment not found for order: " + orderId));
    }
}
