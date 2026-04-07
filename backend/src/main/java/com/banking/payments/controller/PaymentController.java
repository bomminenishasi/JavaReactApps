package com.banking.payments.controller;

import com.banking.common.response.ApiResponse;
import com.banking.payments.dto.CreatePaymentRequest;
import com.banking.payments.dto.PaymentDTO;
import com.banking.payments.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Bill pay and scheduled payments")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    @Operation(summary = "Get all payments for current user")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> getPayments(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            paymentService.getPayments(userDetails.getUsername(), PageRequest.of(page, size))
        ));
    }

    @PostMapping
    @Operation(summary = "Schedule a bill payment")
    public ResponseEntity<ApiResponse<PaymentDTO>> createPayment(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CreatePaymentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Payment scheduled", paymentService.createPayment(userDetails.getUsername(), request)));
    }

    @DeleteMapping("/{paymentId}")
    @Operation(summary = "Cancel a scheduled payment")
    public ResponseEntity<ApiResponse<Void>> cancelPayment(
        @PathVariable Long paymentId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        paymentService.cancelPayment(paymentId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Payment cancelled", null));
    }
}
