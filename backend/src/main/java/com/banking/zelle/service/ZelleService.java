package com.banking.zelle.service;

import com.banking.accounts.entity.Account;
import com.banking.accounts.repository.AccountRepository;
import com.banking.common.exception.BusinessException;
import com.banking.common.exception.ResourceNotFoundException;
import com.banking.rewards.service.RewardsService;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import com.banking.zelle.dto.SendZelleRequest;
import com.banking.zelle.dto.ZelleTransferDTO;
import com.banking.zelle.entity.ZelleTransfer;
import com.banking.zelle.repository.ZelleTransferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ZelleService {

    private final ZelleTransferRepository zelleTransferRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final RewardsService rewardsService;

    @Transactional
    public ZelleTransferDTO send(String email, SendZelleRequest req) {
        if (req.getRecipientEmail() == null && req.getRecipientPhone() == null)
            throw new BusinessException("Recipient email or phone is required");

        User sender = getUser(email);
        Account fromAccount = accountRepository.findById(req.getFromAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!fromAccount.getUser().getUserId().equals(sender.getUserId()))
            throw new BusinessException("Account does not belong to you");
        if (fromAccount.getBalance().compareTo(req.getAmount()) < 0)
            throw new BusinessException("Insufficient balance");

        fromAccount.setBalance(fromAccount.getBalance().subtract(req.getAmount()));
        accountRepository.save(fromAccount);

        ZelleTransfer transfer = ZelleTransfer.builder()
                .sender(sender)
                .fromAccount(fromAccount)
                .recipientEmail(req.getRecipientEmail())
                .recipientPhone(req.getRecipientPhone())
                .recipientName(req.getRecipientName())
                .amount(req.getAmount())
                .note(req.getNote())
                .direction(ZelleTransfer.TransferDirection.SENT)
                .status(ZelleTransfer.TransferStatus.COMPLETED)
                .build();

        ZelleTransfer saved = zelleTransferRepository.save(transfer);

        // Award 10 pts per Zelle transfer
        rewardsService.addPoints(sender, 10L, "Zelle transfer reward", saved.getTransferId().toString());

        return toDTO(saved);
    }

    public Page<ZelleTransferDTO> getHistory(String email, Pageable pageable) {
        User user = getUser(email);
        return zelleTransferRepository.findBySenderOrderByCreatedAtDesc(user, pageable).map(this::toDTO);
    }

    public Map<String, List<String>> getRecentContacts(String email) {
        User user = getUser(email);
        return Map.of(
                "emails", zelleTransferRepository.findRecentEmailsByUser(user),
                "phones", zelleTransferRepository.findRecentPhonesByUser(user)
        );
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private ZelleTransferDTO toDTO(ZelleTransfer t) {
        ZelleTransferDTO dto = new ZelleTransferDTO();
        dto.setTransferId(t.getTransferId());
        dto.setRecipientEmail(t.getRecipientEmail());
        dto.setRecipientPhone(t.getRecipientPhone());
        dto.setRecipientName(t.getRecipientName());
        dto.setAmount(t.getAmount());
        dto.setNote(t.getNote());
        dto.setDirection(t.getDirection().name());
        dto.setStatus(t.getStatus().name());
        dto.setFromAccountNumber(t.getFromAccount().getAccountNumber());
        dto.setCreatedAt(t.getCreatedAt());
        return dto;
    }
}
