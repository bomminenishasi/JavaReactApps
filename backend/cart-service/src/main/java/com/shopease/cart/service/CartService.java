package com.shopease.cart.service;

import com.shopease.cart.dto.AddToCartRequest;
import com.shopease.cart.dto.CartDto;
import com.shopease.cart.dto.CartItemDto;
import com.shopease.cart.entity.Cart;
import com.shopease.cart.entity.CartItem;
import com.shopease.cart.repository.CartItemRepository;
import com.shopease.cart.repository.CartRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public CartDto getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        return toDto(cart);
    }

    @Transactional
    public CartDto addToCart(Long userId, AddToCartRequest req) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));

        cart.getItems().stream()
            .filter(i -> i.getProductId().equals(req.getProductId()))
            .findFirst()
            .ifPresentOrElse(
                existing -> existing.setQuantity(existing.getQuantity() + req.getQuantity()),
                () -> cart.getItems().add(CartItem.builder()
                    .cart(cart)
                    .productId(req.getProductId())
                    .productName(req.getProductName())
                    .productSku(req.getProductSku())
                    .unitPrice(req.getUnitPrice())
                    .quantity(req.getQuantity())
                    .imageUrl(req.getImageUrl())
                    .build())
            );

        return toDto(cartRepository.save(cart));
    }

    @Transactional
    public CartDto updateItem(Long cartItemId, int quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return toDto(item.getCart());
    }

    @Transactional
    public CartDto removeItem(Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
            .orElseThrow(() -> new IllegalArgumentException("Cart item not found"));
        Cart cart = item.getCart();
        cart.getItems().remove(item);
        return toDto(cartRepository.save(cart));
    }

    @Transactional
    public CartDto clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
            .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        cart.getItems().clear();
        return toDto(cartRepository.save(cart));
    }

    private CartDto toDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream().map(i ->
            CartItemDto.builder()
                .id(i.getId()).productId(i.getProductId())
                .productName(i.getProductName()).productSku(i.getProductSku())
                .unitPrice(i.getUnitPrice())
                .totalPrice(i.getUnitPrice() * i.getQuantity())
                .quantity(i.getQuantity()).imageUrl(i.getImageUrl())
                .build()
        ).collect(Collectors.toList());

        double subtotal = items.stream().mapToDouble(CartItemDto::getTotalPrice).sum();
        double tax = subtotal * 0.08;
        double total = subtotal + tax;

        return CartDto.builder()
            .id(cart.getId()).userId(cart.getUserId())
            .items(items).subtotal(subtotal).tax(tax).discount(0.0).total(total)
            .itemCount(items.stream().mapToInt(CartItemDto::getQuantity).sum())
            .updatedAt(cart.getUpdatedAt())
            .build();
    }
}
