package com.tenpista.challenge.backend.domain.port.output;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;

public interface TransactionRepositoryPort {
    PageResult<Transaction> findAll(String tenpistaName, int page, int size);
    Transaction save(Transaction transaction);
}
