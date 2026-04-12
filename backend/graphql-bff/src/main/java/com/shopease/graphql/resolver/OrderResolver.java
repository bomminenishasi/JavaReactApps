package com.shopease.graphql.resolver;

import com.shopease.graphql.model.CancelResult;
import com.shopease.graphql.model.CreateOrderInput;
import com.shopease.graphql.model.Order;
import com.shopease.graphql.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class OrderResolver {

    private final OrderService orderService;

    @QueryMapping
    public Mono<List<Order>> orders(@Argument String userId) {
        return orderService.getOrdersByUser(userId);
    }

    @QueryMapping
    public Mono<Order> order(@Argument String id) {
        return orderService.getOrderById(id);
    }

    @MutationMapping
    public Mono<Order> createOrder(@Argument CreateOrderInput input) {
        return orderService.createOrder(input);
    }

    @MutationMapping
    public Mono<CancelResult> cancelOrder(@Argument String orderId, @Argument String reason) {
        return orderService.cancelOrder(orderId, reason);
    }

    @SubscriptionMapping
    public Flux<Order> orderStatusUpdated(@Argument String orderId) {
        return orderService.subscribeToOrderUpdates(orderId);
    }
}
