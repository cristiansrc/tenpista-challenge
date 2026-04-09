package com.tenpista.challenge.backend.infrastructure.adapter.input.rest;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.domain.port.input.TransactionUseCase;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.api.TransactionsApi;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionCreateRequest;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionPage;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionResponse;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.mapper.TransactionRestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class TransactionController implements TransactionsApi {

    private final TransactionUseCase transactionUseCase;
    private final TransactionRestMapper transactionRestMapper;

    @Override
    public ResponseEntity<TransactionPage> listTransactions(
            String tenpistaName,
            String commerceName,
            java.time.OffsetDateTime fromDate,
            java.time.OffsetDateTime toDate,
            Integer page,
            Integer size
    ) {
        PageResult<Transaction> result = transactionUseCase.listTransactions(
                tenpistaName,
                commerceName,
                fromDate,
                toDate,
                page != null ? page : 0,
                size != null ? size : 10
        );
        return ResponseEntity.ok(transactionRestMapper.toPageDto(result));
    }

    @Override
    public ResponseEntity<TransactionResponse> createTransaction(
            TransactionCreateRequest transactionCreateRequest
    ) {
        Transaction transaction = transactionRestMapper.toDomain(transactionCreateRequest);
        Transaction saved = transactionUseCase.createTransaction(transaction);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionRestMapper.toDto(saved));
    }
}
