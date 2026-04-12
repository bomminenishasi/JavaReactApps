package com.shopease.payment.kafka;

import com.shopease.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final PaymentService paymentService;

    @KafkaListener(topics = "order-events", groupId = "payment-group")
    public void handleOrderEvent(Map<String, Object> event) {
        String type = (String) event.get("eventType");
        if ("ORDER_CREATED".equals(type)) {
            Long orderId = ((Number) event.get("orderId")).longValue();
            Long userId = ((Number) event.get("userId")).longValue();
            Double total = ((Number) event.get("total")).doubleValue();
            log.info("Processing payment for order={}", orderId);
            paymentService.processPayment(orderId, userId, total, "CREDIT_CARD");
        }
    }
}
