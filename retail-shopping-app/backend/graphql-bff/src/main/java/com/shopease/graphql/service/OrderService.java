package com.shopease.graphql.service;

import com.shopease.graphql.model.CancelResult;
import com.shopease.graphql.model.CreateOrderInput;
import com.shopease.graphql.model.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final WebClient orderWebClient;
    private final Map<String, Sinks.Many<Order>> orderSinks = new ConcurrentHashMap<>();

    public Mono<List<Order>> getOrdersByUser(String userId) {
        return orderWebClient.get().uri("/api/orders?userId=" + userId)
            .retrieve()
            .bodyToFlux(Order.class)
            .collectList()
            .onErrorResume(e -> {
                log.error("Error fetching orders for user {}: {}", userId, e.getMessage());
                return Mono.just(List.of());
            });
    }

    public Mono<Order> getOrderById(String id) {
        return orderWebClient.get().uri("/api/orders/" + id)
            .retrieve()
            .bodyToMono(Order.class)
            .onErrorResume(e -> {
                log.error("Error fetching order {}: {}", id, e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<Order> createOrder(CreateOrderInput input) {
        return orderWebClient.post().uri("/api/orders")
            .bodyValue(input)
            .retrieve()
            .bodyToMono(Order.class)
            .onErrorResume(e -> {
                log.error("Error creating order: {}", e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<CancelResult> cancelOrder(String orderId, String reason) {
        return orderWebClient.post().uri("/api/orders/" + orderId + "/cancel")
            .bodyValue(Map.of("reason", reason != null ? reason : ""))
            .retrieve()
            .bodyToMono(CancelResult.class)
            .onErrorResume(e -> {
                log.error("Error cancelling order {}: {}", orderId, e.getMessage());
                return Mono.empty();
            });
    }

    public Flux<Order> subscribeToOrderUpdates(String orderId) {
        return orderSinks.computeIfAbsent(orderId, k -> Sinks.many().multicast().onBackpressureBuffer()).asFlux();
    }
}
