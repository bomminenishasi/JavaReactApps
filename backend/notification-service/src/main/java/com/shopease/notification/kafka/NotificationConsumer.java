package com.shopease.notification.kafka;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class NotificationConsumer {

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void handleOrderEvent(Map<String, Object> event) {
        String type = (String) event.get("eventType");
        log.info("[NOTIFICATION] Order event received: type={}, data={}", type, event);

        switch (type != null ? type : "") {
            case "ORDER_CREATED" -> log.info("[EMAIL] Order confirmation sent for order={}",
                event.get("orderNumber"));
            case "ORDER_CANCELLED" -> log.info("[EMAIL] Order cancellation notice sent for order={}",
                event.get("orderNumber"));
        }
    }

    @KafkaListener(topics = "payment-events", groupId = "notification-group")
    public void handlePaymentEvent(Map<String, Object> event) {
        String type = (String) event.get("eventType");
        log.info("[NOTIFICATION] Payment event received: type={}", type);

        if ("PAYMENT_CAPTURED".equals(type)) {
            log.info("[EMAIL] Payment receipt sent for order={}, txn={}",
                event.get("orderId"), event.get("transactionId"));
        }
    }

    @KafkaListener(topics = "user-events", groupId = "notification-group")
    public void handleUserEvent(Map<String, Object> event) {
        String type = (String) event.get("eventType");
        log.info("[NOTIFICATION] User event received: type={}", type);

        if ("USER_REGISTERED".equals(type)) {
            log.info("[EMAIL] Welcome email sent to {}", event.get("email"));
        }
    }
}
