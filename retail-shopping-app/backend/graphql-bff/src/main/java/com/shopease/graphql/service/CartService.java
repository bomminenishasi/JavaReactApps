package com.shopease.graphql.service;

import com.shopease.graphql.model.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final WebClient cartWebClient;
    private final WebClient productWebClient;
    private final Map<String, Sinks.Many<Cart>> cartSinks = new ConcurrentHashMap<>();

    public Mono<Cart> getCart(String userId) {
        return cartWebClient.get().uri("/api/cart/" + userId)
            .retrieve()
            .bodyToMono(CartResponse.class)
            .map(this::toCart)
            .onErrorResume(e -> {
                log.error("Error fetching cart for user {}: {}", userId, e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<Cart> addToCart(String userId, String productId, int quantity) {
        return productWebClient.get().uri("/api/products/" + productId)
            .retrieve()
            .bodyToMono(Product.class)
            .flatMap(product -> {
                Map<String, Object> body = new HashMap<>();
                body.put("productId", Long.parseLong(productId));
                body.put("productName", product.getName());
                body.put("productSku", product.getSku());
                body.put("unitPrice", product.getPrice());
                body.put("quantity", quantity);
                body.put("imageUrl", product.getImages() != null && !product.getImages().isEmpty()
                    ? product.getImages().get(0) : "");

                return cartWebClient.post().uri("/api/cart/" + userId + "/items")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(CartResponse.class)
                    .map(this::toCart);
            })
            .doOnNext(cart -> publishCartUpdate(userId, cart))
            .onErrorResume(e -> {
                log.error("Error adding to cart: {}", e.getMessage());
                return Mono.error(new RuntimeException("Failed to add item to cart: " + e.getMessage()));
            });
    }

    public Mono<Cart> updateCartItem(String cartItemId, int quantity) {
        return cartWebClient.put().uri("/api/cart/items/" + cartItemId)
            .bodyValue(Map.of("quantity", quantity))
            .retrieve()
            .bodyToMono(CartResponse.class)
            .map(this::toCart)
            .onErrorResume(e -> {
                log.error("Error updating cart item: {}", e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<Cart> removeFromCart(String cartItemId) {
        return cartWebClient.delete().uri("/api/cart/items/" + cartItemId)
            .retrieve()
            .bodyToMono(CartResponse.class)
            .map(this::toCart)
            .onErrorResume(e -> {
                log.error("Error removing cart item: {}", e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<Cart> clearCart(String userId) {
        return cartWebClient.delete().uri("/api/cart/" + userId)
            .retrieve()
            .bodyToMono(CartResponse.class)
            .map(this::toCart)
            .onErrorResume(e -> {
                log.error("Error clearing cart: {}", e.getMessage());
                return Mono.empty();
            });
    }

    public Flux<Cart> subscribeToCartUpdates(String userId) {
        return cartSinks.computeIfAbsent(userId, k -> Sinks.many().multicast().onBackpressureBuffer()).asFlux();
    }

    private void publishCartUpdate(String userId, Cart cart) {
        Sinks.Many<Cart> sink = cartSinks.get(userId);
        if (sink != null && cart != null) {
            sink.tryEmitNext(cart);
        }
    }

    private Cart toCart(CartResponse r) {
        Cart cart = new Cart();
        cart.setId(r.getId() != null ? r.getId().toString() : null);
        cart.setUserId(r.getUserId() != null ? r.getUserId().toString() : null);
        cart.setSubtotal(r.getSubtotal());
        cart.setTax(r.getTax());
        cart.setDiscount(r.getDiscount());
        cart.setTotal(r.getTotal());
        cart.setItemCount(r.getItemCount());
        cart.setUpdatedAt(r.getUpdatedAt());

        List<CartItem> items = r.getItems() != null
            ? r.getItems().stream().map(this::toCartItem).collect(Collectors.toList())
            : Collections.emptyList();
        cart.setItems(items);

        return cart;
    }

    private CartItem toCartItem(CartItemResponse r) {
        // Build a minimal Product from the fields the cart-service embeds
        Product product = new Product();
        product.setId(r.getProductId() != null ? r.getProductId().toString() : null);
        product.setName(r.getProductName() != null ? r.getProductName() : "");
        product.setSku(r.getProductSku() != null ? r.getProductSku() : "");
        product.setPrice(r.getUnitPrice() != null ? r.getUnitPrice() : 0.0);
        product.setImages(r.getImageUrl() != null && !r.getImageUrl().isBlank()
            ? List.of(r.getImageUrl()) : Collections.emptyList());
        // Fill required non-null fields with safe defaults
        product.setDescription("");
        product.setBrand("");
        product.setRating(0.0);
        product.setReviewCount(0);
        product.setInStock(true);
        product.setStockQuantity(0);
        product.setTags(Collections.emptyList());

        CartItem item = new CartItem();
        item.setId(r.getId() != null ? r.getId().toString() : null);
        item.setProduct(product);
        item.setQuantity(r.getQuantity());
        item.setUnitPrice(r.getUnitPrice());
        item.setTotalPrice(r.getTotalPrice());
        return item;
    }
}
