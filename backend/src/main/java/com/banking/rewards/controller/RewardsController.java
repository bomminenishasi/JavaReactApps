package com.banking.rewards.controller;

import com.banking.common.response.ApiResponse;
import com.banking.rewards.dto.RedeemRequest;
import com.banking.rewards.service.RewardsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
public class RewardsController {

    private final RewardsService rewardsService;

    @GetMapping
    public ResponseEntity<?> getSummary(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.ok(rewardsService.getSummary(user.getUsername())));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@AuthenticationPrincipal UserDetails user,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                rewardsService.getHistory(user.getUsername(), PageRequest.of(page, size))));
    }

    @PostMapping("/redeem")
    public ResponseEntity<?> redeem(@AuthenticationPrincipal UserDetails user,
                                    @Valid @RequestBody RedeemRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Points redeemed successfully", rewardsService.redeem(user.getUsername(), req)));
    }
}
