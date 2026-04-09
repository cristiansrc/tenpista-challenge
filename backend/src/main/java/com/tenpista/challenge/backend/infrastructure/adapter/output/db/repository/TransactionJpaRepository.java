package com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository;

import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.TransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionJpaRepository extends JpaRepository<TransactionEntity, Long> {
    Page<TransactionEntity> findByTenpistaNameContainingIgnoreCase(String tenpistaName, Pageable pageable);
}
