package com.tenpista.challenge.backend.domain.port.input;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;

public interface TransactionUseCase {
    PageResult<Transaction> listTransactions(String tenpistaName, int page, int size);
    Transaction createTransaction(Transaction transaction);
}
