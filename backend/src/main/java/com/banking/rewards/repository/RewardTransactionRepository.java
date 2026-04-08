package com.banking.rewards.repository;

import com.banking.rewards.entity.RewardTransaction;
import com.banking.users.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardTransactionRepository extends JpaRepository<RewardTransaction, Long> {
    Page<RewardTransaction> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
