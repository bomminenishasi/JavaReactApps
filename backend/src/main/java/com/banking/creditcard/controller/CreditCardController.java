package com.banking.creditcard.controller;

import com.banking.common.response.ApiResponse;
import com.banking.creditcard.dto.ApplyCardRequest;
import com.banking.creditcard.dto.CardPaymentRequest;
import com.banking.creditcard.service.CreditCardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/credit-cards")
@RequiredArgsConstructor
public class CreditCardController {

    private final CreditCardService creditCardService;

    @GetMapping
    public ResponseEntity<?> getMyCards(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.ok(creditCardService.getUserCards(user.getUsername())));
    }

    @PostMapping
    public ResponseEntity<?> applyForCard(@AuthenticationPrincipal UserDetails user,
                                          @Valid @RequestBody ApplyCardRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Card approved", creditCardService.applyForCard(user.getUsername(), req)));
    }

    @PostMapping("/{cardId}/payment")
    public ResponseEntity<?> makePayment(@AuthenticationPrincipal UserDetails user,
                                         @PathVariable Long cardId,
                                         @Valid @RequestBody CardPaymentRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Payment successful", creditCardService.makePayment(user.getUsername(), cardId, req)));
    }
}
