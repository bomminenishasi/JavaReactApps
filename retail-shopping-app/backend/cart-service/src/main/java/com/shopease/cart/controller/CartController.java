package com.shopease.cart.controller;

import com.shopease.cart.dto.AddToCartRequest;
import com.shopease.cart.dto.CartDto;
import com.shopease.cart.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<CartDto> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartDto> addToCart(@PathVariable Long userId,
                                              @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> updateItem(@PathVariable Long cartItemId,
                                               @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(cartService.updateItem(cartItemId, body.get("quantity")));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<CartDto> removeItem(@PathVariable Long cartItemId) {
        return ResponseEntity.ok(cartService.removeItem(cartItemId));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<CartDto> clearCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.clearCart(userId));
    }
}
