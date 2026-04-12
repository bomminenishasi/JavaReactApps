package com.shopease.order.kafka;

import com.shopease.order.entity.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishOrderCreated(Order order) {
        Map<String, Object> event = Map.of(
            "eventType", "ORDER_CREATED",
            "orderId", order.getId(),
            "orderNumber", order.getOrderNumber(),
            "userId", order.getUserId(),
            "total", order.getTotal()
        );
        kafkaTemplate.send("order-events", String.valueOf(order.getId()), event);
        log.info("Published ORDER_CREATED for order={}", order.getOrderNumber());
    }

    public void publishOrderCancelled(Order order, String reason) {
        Map<String, Object> event = Map.of(
            "eventType", "ORDER_CANCELLED",
            "orderId", order.getId(),
            "orderNumber", order.getOrderNumber(),
            "reason", reason != null ? reason : ""
        );
        kafkaTemplate.send("order-events", String.valueOf(order.getId()), event);
        log.info("Published ORDER_CANCELLED for order={}", order.getOrderNumber());
    }
}
