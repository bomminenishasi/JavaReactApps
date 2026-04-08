package com.banking.rewards.repository;

import com.banking.rewards.entity.Rewards;
import com.banking.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RewardsRepository extends JpaRepository<Rewards, Long> {
    Optional<Rewards> findByUser(User user);
}
