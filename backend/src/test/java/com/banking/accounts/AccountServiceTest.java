package com.banking.accounts;

import com.banking.accounts.dto.AccountDTO;
import com.banking.accounts.dto.CreateAccountRequest;
import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.accounts.service.AccountService;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.common.util.AccountNumberGenerator;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AccountService Unit Tests")
class AccountServiceTest {

    @Mock AccountRepository        accountRepository;
    @Mock UserRepository           userRepository;
    @Mock AccountNumberGenerator   accountNumberGenerator;

    @InjectMocks AccountService accountService;

    private User testUser;
    private Account savingsAccount;
    private Account checkingAccount;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("john@example.com")
                .firstName("John")
                .lastName("Doe")
                .role("CUSTOMER")
                .build();

        savingsAccount = Account.builder()
                .accountId(1L)
                .user(testUser)
                .accountNumber("SAV-001")
                .accountType(Account.AccountType.SAVINGS)
                .balance(BigDecimal.valueOf(1000))
                .currency("USD")
                .status(Account.AccountStatus.ACTIVE)
                .build();

        checkingAccount = Account.builder()
                .accountId(2L)
                .user(testUser)
                .accountNumber("CHK-001")
                .accountType(Account.AccountType.CHECKING)
                .balance(BigDecimal.valueOf(500))
                .currency("USD")
                .status(Account.AccountStatus.ACTIVE)
                .build();
    }

    // ── getUserAccounts ───────────────────────────────────────────────────────

    @Test
    @DisplayName("getUserAccounts: returns all accounts for user")
    void getUserAccounts_returnsAllAccounts() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(accountRepository.findByUserOrderByCreatedAtDesc(testUser))
                .thenReturn(List.of(savingsAccount, checkingAccount));

        List<AccountDTO> result = accountService.getUserAccounts("john@example.com");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(AccountDTO::getAccountType)
                .containsExactlyInAnyOrder("SAVINGS", "CHECKING");
    }

    @Test
    @DisplayName("getUserAccounts: unknown user throws ResourceNotFoundException")
    void getUserAccounts_unknownUser_throws() {
        when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getUserAccounts("nobody@example.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── getAccount ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAccount: returns account when owner matches")
    void getAccount_ownerMatches_returnsDTO() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(savingsAccount));

        AccountDTO dto = accountService.getAccount(1L, "john@example.com");

        assertThat(dto.getAccountId()).isEqualTo(1L);
        assertThat(dto.getAccountType()).isEqualTo("SAVINGS");
    }

    @Test
    @DisplayName("getAccount: different user throws AccessDeniedException")
    void getAccount_differentUser_throwsAccessDenied() {
        when(accountRepository.findById(1L)).thenReturn(Optional.of(savingsAccount));

        assertThatThrownBy(() -> accountService.getAccount(1L, "other@example.com"))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    @DisplayName("getAccount: missing account throws ResourceNotFoundException")
    void getAccount_missing_throwsNotFound() {
        when(accountRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> accountService.getAccount(99L, "john@example.com"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // ── createAccount (SAVINGS) ───────────────────────────────────────────────

    @Test
    @DisplayName("createAccount: SAVINGS type creates account successfully")
    void createAccount_savings_success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(accountNumberGenerator.generate()).thenReturn("SAV-001");
        when(accountRepository.save(any(Account.class))).thenReturn(savingsAccount);

        CreateAccountRequest req = new CreateAccountRequest();
        req.setAccountType("SAVINGS");

        AccountDTO result = accountService.createAccount("john@example.com", req);

        assertThat(result.getAccountType()).isEqualTo("SAVINGS");
        verify(accountRepository).save(any(Account.class));
    }

    @Test
    @DisplayName("createAccount: invalid type throws BusinessException")
    void createAccount_invalidType_throws() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        CreateAccountRequest req = new CreateAccountRequest();
        req.setAccountType("INVALID");

        assertThatThrownBy(() -> accountService.createAccount("john@example.com", req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid account type");
    }

    @Test
    @DisplayName("createAccount: CHECKING without SSN throws BusinessException")
    void createAccount_checkingMissingSSN_throws() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        CreateAccountRequest req = new CreateAccountRequest();
        req.setAccountType("CHECKING");
        req.setFirstName("John");
        req.setLastName("Doe");
        // ssn missing

        assertThatThrownBy(() -> accountService.createAccount("john@example.com", req))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    @DisplayName("createAccount: CHECKING with all required fields succeeds")
    void createAccount_checkingAllFields_success() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(accountNumberGenerator.generate()).thenReturn("CHK-001");
        when(accountRepository.save(any(Account.class))).thenReturn(checkingAccount);

        CreateAccountRequest req = new CreateAccountRequest();
        req.setAccountType("CHECKING");
        req.setFirstName("John");
        req.setLastName("Doe");
        req.setSsn("123-45-6789");
        req.setDateOfBirth("1990-01-01");
        req.setPhoneNumber("4171234567");
        req.setStreetAddress("123 Main St");
        req.setCity("Newark");
        req.setState("NJ");
        req.setZipCode("07306");
        req.setAnnualIncome(new java.math.BigDecimal("60000"));
        req.setEmploymentStatus("EMPLOYED");
        req.setCountryOfCitizenship("USA");
        req.setAgreedToTerms(true);

        AccountDTO result = accountService.createAccount("john@example.com", req);

        assertThat(result.getAccountType()).isEqualTo("CHECKING");
    }
}
