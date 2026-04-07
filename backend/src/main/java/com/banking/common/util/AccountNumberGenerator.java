package com.banking.common.util;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Random;

@Component
public class AccountNumberGenerator {

    private static final Random RANDOM = new Random();

    public String generate() {
        long timestamp = Instant.now().toEpochMilli() % 100000L;
        int suffix = RANDOM.nextInt(100000);
        return String.format("BANK%05d%05d", timestamp, suffix);
    }
}
