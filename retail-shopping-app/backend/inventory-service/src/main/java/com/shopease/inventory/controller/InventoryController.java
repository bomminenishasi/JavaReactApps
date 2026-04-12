package com.shopease.inventory.controller;

import com.shopease.inventory.entity.Inventory;
import com.shopease.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    public ResponseEntity<Inventory> getInventory(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getByProduct(productId));
    }

    @PostMapping("/{productId}/add")
    public ResponseEntity<Void> addStock(@PathVariable Long productId,
                                          @RequestBody Map<String, Integer> body) {
        inventoryService.addStock(productId, body.get("quantity"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{productId}/deduct")
    public ResponseEntity<Void> deductStock(@PathVariable Long productId,
                                             @RequestBody Map<String, Integer> body) {
        inventoryService.deductStock(productId, body.get("quantity"));
        return ResponseEntity.ok().build();
    }
}
