package com.banking.accounts.service;

import com.banking.accounts.dto.AccountDTO;
import com.banking.accounts.dto.CreateAccountRequest;
import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.common.util.AccountNumberGenerator;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountNumberGenerator accountNumberGenerator;

    public List<AccountDTO> getUserAccounts(String email) {
        User user = getUser(email);
        return accountRepository.findByUserOrderByCreatedAtDesc(user)
            .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public AccountDTO getAccount(Long accountId, String email) {
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new ResourceNotFoundException("Account", accountId));
        if (!account.getUser().getEmail().equals(email)) {
            throw new AccessDeniedException("Access denied to this account");
        }
        return toDTO(account);
    }

    @Transactional
    public AccountDTO createAccount(String email, CreateAccountRequest request) {
        User user = getUser(email);
        Account.AccountType type;
        try {
            type = Account.AccountType.valueOf(request.getAccountType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid account type. Must be SAVINGS or CHECKING");
        }

        String accountNumber;
        do {
            accountNumber = accountNumberGenerator.generate();
        } while (accountRepository.existsByAccountNumber(accountNumber));

        Account account = Account.builder()
            .user(user)
            .accountNumber(accountNumber)
            .accountType(type)
            .currency(request.getCurrency())
            .build();
        return toDTO(accountRepository.save(account));
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public AccountDTO toDTO(Account account) {
        AccountDTO dto = new AccountDTO();
        dto.setAccountId(account.getAccountId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountType(account.getAccountType().name());
        dto.setBalance(account.getBalance());
        dto.setCurrency(account.getCurrency());
        dto.setStatus(account.getStatus().name());
        dto.setCreatedAt(account.getCreatedAt());
        return dto;
    }
}
