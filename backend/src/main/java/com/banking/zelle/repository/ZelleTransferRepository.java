package com.banking.zelle.repository;

import com.banking.users.entity.User;
import com.banking.zelle.entity.ZelleTransfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZelleTransferRepository extends JpaRepository<ZelleTransfer, Long> {
    Page<ZelleTransfer> findBySenderOrderByCreatedAtDesc(User sender, Pageable pageable);

    @Query("SELECT DISTINCT z.recipientEmail FROM ZelleTransfer z WHERE z.sender = :sender AND z.recipientEmail IS NOT NULL ORDER BY z.recipientEmail")
    List<String> findRecentEmailsByUser(User sender);

    @Query("SELECT DISTINCT z.recipientPhone FROM ZelleTransfer z WHERE z.sender = :sender AND z.recipientPhone IS NOT NULL ORDER BY z.recipientPhone")
    List<String> findRecentPhonesByUser(User sender);
}
