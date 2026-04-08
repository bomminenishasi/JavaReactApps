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

import java.time.LocalDate;
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

        // Validate checking-account-specific required fields
        if (type == Account.AccountType.CHECKING) {
            validateCheckingFields(request);
        }

        String accountNumber;
        do {
            accountNumber = accountNumberGenerator.generate();
        } while (accountRepository.existsByAccountNumber(accountNumber));

        // Extract last 4 digits from SSN (format: ###-##-####)
        String ssnLast4 = null;
        if (request.getSsn() != null && !request.getSsn().isBlank()) {
            String digits = request.getSsn().replaceAll("-", "");
            ssnLast4 = digits.substring(Math.max(0, digits.length() - 4));
        }

        LocalDate dob = null;
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            dob = LocalDate.parse(request.getDateOfBirth());
        }

        Account account = Account.builder()
            .user(user)
            .accountNumber(accountNumber)
            .accountType(type)
            .currency(request.getCurrency() != null ? request.getCurrency() : "USD")
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .dateOfBirth(dob)
            .ssnLast4(ssnLast4)
            .countryOfCitizenship(request.getCountryOfCitizenship())
            .phoneNumber(request.getPhoneNumber())
            .streetAddress(request.getStreetAddress())
            .city(request.getCity())
            .state(request.getState())
            .zipCode(request.getZipCode())
            .annualIncome(request.getAnnualIncome())
            .employmentStatus(request.getEmploymentStatus())
            .build();

        return toDTO(accountRepository.save(account));
    }

    private void validateCheckingFields(CreateAccountRequest req) {
        if (isBlank(req.getFirstName()))          throw new BusinessException("First name is required for checking account");
        if (isBlank(req.getLastName()))           throw new BusinessException("Last name is required for checking account");
        if (isBlank(req.getDateOfBirth()))        throw new BusinessException("Date of birth is required for checking account");
        if (isBlank(req.getSsn()))                throw new BusinessException("SSN is required for checking account");
        if (isBlank(req.getCountryOfCitizenship())) throw new BusinessException("Country of citizenship is required for checking account");
        if (isBlank(req.getPhoneNumber()))        throw new BusinessException("Phone number is required for checking account");
        if (isBlank(req.getStreetAddress()))      throw new BusinessException("Street address is required for checking account");
        if (isBlank(req.getCity()))               throw new BusinessException("City is required for checking account");
        if (isBlank(req.getState()))              throw new BusinessException("State is required for checking account");
        if (isBlank(req.getZipCode()))            throw new BusinessException("ZIP code is required for checking account");
        if (req.getAnnualIncome() == null)        throw new BusinessException("Annual income is required for checking account");
        if (isBlank(req.getEmploymentStatus()))   throw new BusinessException("Employment status is required for checking account");
        if (!Boolean.TRUE.equals(req.getAgreedToTerms())) throw new BusinessException("You must agree to the account terms");
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
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
        dto.setFirstName(account.getFirstName());
        dto.setLastName(account.getLastName());
        dto.setDateOfBirth(account.getDateOfBirth());
        dto.setSsnLast4(account.getSsnLast4());
        dto.setCountryOfCitizenship(account.getCountryOfCitizenship());
        dto.setPhoneNumber(account.getPhoneNumber());
        dto.setStreetAddress(account.getStreetAddress());
        dto.setCity(account.getCity());
        dto.setState(account.getState());
        dto.setZipCode(account.getZipCode());
        dto.setAnnualIncome(account.getAnnualIncome());
        dto.setEmploymentStatus(account.getEmploymentStatus());
        return dto;
    }
}
