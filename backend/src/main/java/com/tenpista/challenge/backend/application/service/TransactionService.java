package com.tenpista.challenge.backend.application.service;

import com.tenpista.challenge.backend.domain.exception.InvalidBusinessRuleException;
import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.domain.port.input.TransactionUseCase;
import com.tenpista.challenge.backend.domain.port.output.TransactionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class TransactionService implements TransactionUseCase {

    private final TransactionRepositoryPort transactionRepositoryPort;

    @Override
    public PageResult<Transaction> listTransactions(String tenpistaName, int page, int size) {
        return transactionRepositoryPort.findAll(tenpistaName, page, size);
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        if (transaction.getAmount() == null || transaction.getAmount() <= 0) {
            throw new InvalidBusinessRuleException("El monto debe ser mayor a 0.");
        }
        if (transaction.getTransactionDate() == null) {
            throw new InvalidBusinessRuleException("La fecha de transacción es requerida.");
        }
        if (transaction.getTransactionDate().isAfter(OffsetDateTime.now())) {
            throw new InvalidBusinessRuleException("La fecha de transacción no puede ser futura.");
        }
        return transactionRepositoryPort.save(transaction);
    }
}
