package com.shopease.inventory.service;

import com.shopease.inventory.entity.Inventory;
import com.shopease.inventory.repository.InventoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    public Inventory getByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId)
            .orElse(Inventory.builder().productId(productId).quantity(0).build());
    }

    @Transactional
    public void deductStock(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductId(productId)
            .orElseGet(() -> inventoryRepository.save(
                Inventory.builder().productId(productId).quantity(0).build()));

        int newQty = inv.getQuantity() - quantity;
        if (newQty < 0) {
            log.warn("Inventory below zero for product={}, adjusting to 0", productId);
            newQty = 0;
        }
        inv.setQuantity(newQty);
        inventoryRepository.save(inv);
        log.info("Deducted {} units from product={}, remaining={}", quantity, productId, newQty);
    }

    @Transactional
    public void addStock(Long productId, int quantity) {
        Inventory inv = inventoryRepository.findByProductId(productId)
            .orElseGet(() -> inventoryRepository.save(
                Inventory.builder().productId(productId).quantity(0).build()));
        inv.setQuantity(inv.getQuantity() + quantity);
        inventoryRepository.save(inv);
    }
}
