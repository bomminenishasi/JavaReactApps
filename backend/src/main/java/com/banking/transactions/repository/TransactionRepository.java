package com.banking.transactions.repository;

import com.banking.accounts.entity.Account;
import com.banking.transactions.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE t.fromAccount = :account OR t.toAccount = :account ORDER BY t.createdAt DESC")
    Page<Transaction> findByAccount(@Param("account") Account account, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.fromAccount = :account OR t.toAccount = :account ORDER BY t.createdAt DESC")
    List<Transaction> findAllByAccount(@Param("account") Account account);

    Optional<Transaction> findByReferenceNo(String referenceNo);
}
