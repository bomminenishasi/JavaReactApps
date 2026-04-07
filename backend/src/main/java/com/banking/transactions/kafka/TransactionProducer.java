package com.banking.transactions.kafka;

import com.banking.config.KafkaConfig;
import com.banking.transactions.dto.TransactionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionProducer {

    private final KafkaTemplate<String, TransactionEvent> kafkaTemplate;

    public void sendTransactionInitiated(TransactionEvent event) {
        log.info("Publishing txn-initiated event: {}", event.getReferenceNo());
        kafkaTemplate.send(KafkaConfig.TOPIC_TXN_INITIATED, event.getReferenceNo(), event);
    }

    public void sendTransactionCompleted(TransactionEvent event) {
        log.info("Publishing txn-completed event: {}", event.getReferenceNo());
        kafkaTemplate.send(KafkaConfig.TOPIC_TXN_COMPLETED, event.getReferenceNo(), event);
    }

    public void sendTransactionFailed(TransactionEvent event) {
        log.warn("Publishing txn-failed event: {}", event.getReferenceNo());
        kafkaTemplate.send(KafkaConfig.TOPIC_TXN_FAILED, event.getReferenceNo(), event);
    }
}
