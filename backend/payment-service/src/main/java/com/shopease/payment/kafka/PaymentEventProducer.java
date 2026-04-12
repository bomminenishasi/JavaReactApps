package com.shopease.payment.kafka;

import com.shopease.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishPaymentCaptured(Payment payment) {
        Map<String, Object> event = Map.of(
            "eventType", "PAYMENT_CAPTURED",
            "paymentId", payment.getId(),
            "orderId", payment.getOrderId(),
            "amount", payment.getAmount(),
            "transactionId", payment.getTransactionId()
        );
        kafkaTemplate.send("payment-events", String.valueOf(payment.getOrderId()), event);
    }
}
