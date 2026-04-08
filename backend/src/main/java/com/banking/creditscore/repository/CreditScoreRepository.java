package com.banking.creditscore.repository;

import com.banking.creditscore.entity.CreditScore;
import com.banking.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreditScoreRepository extends JpaRepository<CreditScore, Long> {
    Optional<CreditScore> findByUser(User user);
}
