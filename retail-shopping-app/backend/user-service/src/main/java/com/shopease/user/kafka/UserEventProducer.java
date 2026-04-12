package com.shopease.user.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistered(Long userId, String email) {
        Map<String, Object> event = Map.of(
            "eventType", "USER_REGISTERED",
            "userId", userId,
            "email", email
        );
        kafkaTemplate.send("user-events", String.valueOf(userId), event);
        log.info("Published USER_REGISTERED event for userId={}", userId);
    }
}
