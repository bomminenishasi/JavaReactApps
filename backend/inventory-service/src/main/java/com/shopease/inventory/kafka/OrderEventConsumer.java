package com.shopease.inventory.kafka;

import com.shopease.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final InventoryService inventoryService;

    @KafkaListener(topics = "order-events", groupId = "inventory-group")
    public void handleOrderEvent(Map<String, Object> event) {
        String type = (String) event.get("eventType");
        if ("ORDER_CREATED".equals(type)) {
            log.info("Inventory: processing ORDER_CREATED event");
            // In a real system, items would be in the event; here we log
            Long orderId = ((Number) event.get("orderId")).longValue();
            log.info("Inventory reserved for order={}", orderId);
        }
    }
}
