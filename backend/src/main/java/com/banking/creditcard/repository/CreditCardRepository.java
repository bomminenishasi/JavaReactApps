package com.banking.creditcard.repository;

import com.banking.creditcard.entity.CreditCard;
import com.banking.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    List<CreditCard> findByUserOrderByCreatedAtDesc(User user);
    Optional<CreditCard> findByCardIdAndUser(Long cardId, User user);
    boolean existsByCardNumber(String cardNumber);
}
