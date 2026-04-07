package com.banking.accounts.controller;

import com.banking.accounts.dto.AccountDTO;
import com.banking.accounts.dto.CreateAccountRequest;
import com.banking.accounts.service.AccountService;
import com.banking.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Bank account management")
@SecurityRequirement(name = "bearerAuth")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @Operation(summary = "Get all accounts for current user")
    public ResponseEntity<ApiResponse<List<AccountDTO>>> getAccounts(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.getUserAccounts(userDetails.getUsername())));
    }

    @GetMapping("/{accountId}")
    @Operation(summary = "Get account detail")
    public ResponseEntity<ApiResponse<AccountDTO>> getAccount(
        @PathVariable Long accountId,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(ApiResponse.ok(accountService.getAccount(accountId, userDetails.getUsername())));
    }

    @PostMapping
    @Operation(summary = "Create a new bank account")
    public ResponseEntity<ApiResponse<AccountDTO>> createAccount(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CreateAccountRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Account created", accountService.createAccount(userDetails.getUsername(), request)));
    }
}
