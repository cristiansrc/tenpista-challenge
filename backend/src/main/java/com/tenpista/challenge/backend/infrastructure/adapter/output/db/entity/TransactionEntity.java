package com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer amount;

    @Column(name = "commerce_name", nullable = false, length = 255)
    private String commerceName;

    @Column(name = "tenpista_name", nullable = false, length = 255)
    private String tenpistaName;

    @Column(name = "transaction_date", nullable = false)
    private OffsetDateTime transactionDate;

    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }
}
