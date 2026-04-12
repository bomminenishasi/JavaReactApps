package com.shopease.order.service;

import com.shopease.order.dto.*;
import com.shopease.order.entity.Order;
import com.shopease.order.entity.OrderItem;
import com.shopease.order.entity.OrderStatus;
import com.shopease.order.kafka.OrderEventProducer;
import com.shopease.order.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderEventProducer eventProducer;

    public List<OrderDto> getOrdersByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream().map(this::toDto).collect(Collectors.toList());
    }

    public OrderDto getOrder(Long id) {
        return orderRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    @Transactional
    public OrderDto createOrder(CreateOrderRequest req) {
        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        AddressDto sa = req.getShippingAddress();
        AddressDto ba = req.getBillingAddress();

        Order order = Order.builder()
            .orderNumber(orderNumber)
            .userId(req.getUserId())
            .shippingStreet(sa != null ? sa.getStreet() : null)
            .shippingCity(sa != null ? sa.getCity() : null)
            .shippingState(sa != null ? sa.getState() : null)
            .shippingZip(sa != null ? sa.getZipCode() : null)
            .shippingCountry(sa != null ? sa.getCountry() : null)
            .billingStreet(ba != null ? ba.getStreet() : null)
            .billingCity(ba != null ? ba.getCity() : null)
            .billingState(ba != null ? ba.getState() : null)
            .billingZip(ba != null ? ba.getZipCode() : null)
            .billingCountry(ba != null ? ba.getCountry() : null)
            .paymentMethod(req.getPaymentMethod())
            .subtotal(req.getSubtotal() != null ? req.getSubtotal() : 0.0)
            .tax(req.getTax() != null ? req.getTax() : 0.0)
            .shippingCost(req.getShippingCost() != null ? req.getShippingCost() : 0.0)
            .discount(req.getDiscount() != null ? req.getDiscount() : 0.0)
            .total(req.getTotal() != null ? req.getTotal() : 0.0)
            .estimatedDelivery(LocalDateTime.now().plusDays(5))
            .build();

        order = orderRepository.save(order);

        if (req.getItems() != null) {
            final Order savedOrder = order;
            List<OrderItem> items = req.getItems().stream().map(i -> OrderItem.builder()
                .order(savedOrder)
                .productId(i.getProductId())
                .productName(i.getProductName())
                .sku(i.getSku())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .totalPrice(i.getUnitPrice() * i.getQuantity())
                .build()
            ).collect(Collectors.toList());
            order.setItems(items);
            order = orderRepository.save(order);
        }

        eventProducer.publishOrderCreated(order);
        return toDto(order);
    }

    @Transactional
    public OrderDto cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        eventProducer.publishOrderCancelled(order, reason);
        return toDto(order);
    }

    private OrderDto toDto(Order o) {
        AddressDto shipping = AddressDto.builder()
            .street(o.getShippingStreet()).city(o.getShippingCity())
            .state(o.getShippingState()).zipCode(o.getShippingZip())
            .country(o.getShippingCountry()).build();
        AddressDto billing = AddressDto.builder()
            .street(o.getBillingStreet()).city(o.getBillingCity())
            .state(o.getBillingState()).zipCode(o.getBillingZip())
            .country(o.getBillingCountry()).build();

        List<OrderItemDto> items = o.getItems() != null ? o.getItems().stream().map(i ->
            OrderItemDto.builder().id(i.getId()).productId(i.getProductId())
                .productName(i.getProductName()).sku(i.getSku())
                .quantity(i.getQuantity()).unitPrice(i.getUnitPrice())
                .totalPrice(i.getTotalPrice()).build()
        ).collect(Collectors.toList()) : List.of();

        return OrderDto.builder()
            .id(o.getId()).orderNumber(o.getOrderNumber()).userId(o.getUserId())
            .items(items).shippingAddress(shipping).billingAddress(billing)
            .status(o.getStatus()).paymentStatus(o.getPaymentStatus())
            .subtotal(o.getSubtotal()).tax(o.getTax()).shippingCost(o.getShippingCost())
            .discount(o.getDiscount()).total(o.getTotal())
            .estimatedDelivery(o.getEstimatedDelivery())
            .createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt())
            .build();
    }
}
