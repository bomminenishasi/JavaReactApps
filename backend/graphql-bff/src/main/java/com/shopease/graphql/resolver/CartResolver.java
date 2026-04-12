package com.shopease.graphql.resolver;

import com.shopease.graphql.model.Cart;
import com.shopease.graphql.service.CartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SubscriptionMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@Controller
@RequiredArgsConstructor
public class CartResolver {

    private final CartService cartService;

    @QueryMapping
    public Mono<Cart> cart(@Argument String userId) {
        return cartService.getCart(userId);
    }

    @MutationMapping
    public Mono<Cart> addToCart(@Argument String userId, @Argument String productId, @Argument Integer quantity) {
        return cartService.addToCart(userId, productId, quantity != null ? quantity : 1);
    }

    @MutationMapping
    public Mono<Cart> updateCartItem(@Argument String cartItemId, @Argument Integer quantity) {
        return cartService.updateCartItem(cartItemId, quantity != null ? quantity : 1);
    }

    @MutationMapping
    public Mono<Cart> removeFromCart(@Argument String cartItemId) {
        return cartService.removeFromCart(cartItemId);
    }

    @MutationMapping
    public Mono<Cart> clearCart(@Argument String userId) {
        return cartService.clearCart(userId);
    }

    @SubscriptionMapping
    public Flux<Cart> cartUpdated(@Argument String userId) {
        return cartService.subscribeToCartUpdates(userId);
    }
}
