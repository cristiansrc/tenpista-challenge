package com.tenpista.challenge.backend.domain.port.input;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;

import java.time.OffsetDateTime;

public interface TransactionUseCase {
    PageResult<Transaction> listTransactions(
            String tenpistaName,
            String commerceName,
            OffsetDateTime fromDate,
            OffsetDateTime toDate,
            int page,
            int size
    );
    Transaction createTransaction(Transaction transaction);
}
