package com.banking.transactions.controller;

import com.banking.common.response.ApiResponse;
import com.banking.transactions.dto.DepositWithdrawRequest;
import com.banking.transactions.dto.TransactionDTO;
import com.banking.transactions.dto.TransferRequest;
import com.banking.transactions.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Fund transfers, deposits, withdrawals")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    @Operation(summary = "Get transaction history for an account")
    public ResponseEntity<ApiResponse<Page<TransactionDTO>>> getTransactions(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam Long accountId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            transactionService.getTransactions(userDetails.getUsername(), accountId, PageRequest.of(page, size))
        ));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Transfer funds between accounts")
    public ResponseEntity<ApiResponse<TransactionDTO>> transfer(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody TransferRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Transfer initiated",
            transactionService.transfer(userDetails.getUsername(), request)));
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds into an account")
    public ResponseEntity<ApiResponse<TransactionDTO>> deposit(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody DepositWithdrawRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Deposit initiated",
            transactionService.deposit(userDetails.getUsername(), request)));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw funds from an account")
    public ResponseEntity<ApiResponse<TransactionDTO>> withdraw(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody DepositWithdrawRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Withdrawal initiated",
            transactionService.withdraw(userDetails.getUsername(), request)));
    }
}
