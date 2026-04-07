package com.banking.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String TOPIC_TXN_INITIATED  = "txn-initiated";
    public static final String TOPIC_TXN_COMPLETED  = "txn-completed";
    public static final String TOPIC_TXN_FAILED     = "txn-failed";
    public static final String TOPIC_PAYMENT_SCHEDULED = "payment-scheduled";

    @Bean
    public NewTopic txnInitiatedTopic() {
        return TopicBuilder.name(TOPIC_TXN_INITIATED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic txnCompletedTopic() {
        return TopicBuilder.name(TOPIC_TXN_COMPLETED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic txnFailedTopic() {
        return TopicBuilder.name(TOPIC_TXN_FAILED).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic paymentScheduledTopic() {
        return TopicBuilder.name(TOPIC_PAYMENT_SCHEDULED).partitions(3).replicas(1).build();
    }
}
