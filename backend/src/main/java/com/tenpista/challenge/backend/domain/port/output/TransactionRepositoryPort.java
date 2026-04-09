package com.tenpista.challenge.backend.domain.port.output;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;

import java.time.OffsetDateTime;

public interface TransactionRepositoryPort {
    PageResult<Transaction> findAll(
            String tenpistaName,
            String commerceName,
            OffsetDateTime fromDate,
            OffsetDateTime toDate,
            int page,
            int size
    );
    Transaction save(Transaction transaction);
}
