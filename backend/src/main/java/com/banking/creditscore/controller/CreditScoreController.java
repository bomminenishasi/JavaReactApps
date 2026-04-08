package com.banking.creditscore.controller;

import com.banking.common.response.ApiResponse;
import com.banking.creditscore.dto.CreditScoreDTO;
import com.banking.creditscore.service.CreditScoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/credit-score")
@RequiredArgsConstructor
@Tag(name = "Credit Score", description = "FICO-style credit score calculation")
@SecurityRequirement(name = "bearerAuth")
public class CreditScoreController {

    private final CreditScoreService creditScoreService;

    @GetMapping
    @Operation(summary = "Get current user's credit score")
    public ResponseEntity<ApiResponse<CreditScoreDTO>> getScore(
            @AuthenticationPrincipal UserDetails userDetails) {
        CreditScoreDTO dto = creditScoreService.getScore(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(dto));
    }
}
