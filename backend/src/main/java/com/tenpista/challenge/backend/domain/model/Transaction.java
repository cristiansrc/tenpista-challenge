package com.tenpista.challenge.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    private Long id;
    private Integer amount;
    private String commerceName;
    private String tenpistaName;
    private OffsetDateTime transactionDate;
    private OffsetDateTime createdAt;
}
