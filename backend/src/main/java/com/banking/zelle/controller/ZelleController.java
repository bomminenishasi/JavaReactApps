package com.banking.zelle.controller;

import com.banking.common.response.ApiResponse;
import com.banking.zelle.dto.SendZelleRequest;
import com.banking.zelle.service.ZelleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/zelle")
@RequiredArgsConstructor
public class ZelleController {

    private final ZelleService zelleService;

    @PostMapping("/send")
    public ResponseEntity<?> send(@AuthenticationPrincipal UserDetails user,
                                  @Valid @RequestBody SendZelleRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Money sent via Zelle", zelleService.send(user.getUsername(), req)));
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(@AuthenticationPrincipal UserDetails user,
                                     @RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                zelleService.getHistory(user.getUsername(), PageRequest.of(page, size))));
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> contacts(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(ApiResponse.ok(zelleService.getRecentContacts(user.getUsername())));
    }
}
