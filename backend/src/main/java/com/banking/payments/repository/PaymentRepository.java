package com.banking.payments.repository;

import com.banking.payments.entity.Payment;
import com.banking.users.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Page<Payment> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    List<Payment> findByStatusAndScheduledDateLessThanEqual(
        Payment.PaymentStatus status, LocalDate date
    );
}
