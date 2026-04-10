package com.tenpista.challenge.backend.infrastructure.adapter.input.rest;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.domain.port.input.TransactionUseCase;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionCreateRequest;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionPage;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionResponse;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.mapper.TransactionRestMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionControllerTest {

    @Mock
    private TransactionUseCase transactionUseCase;

    @Mock
    private TransactionRestMapper transactionRestMapper;

    @InjectMocks
    private TransactionController controller;

    @Test
    void listTransactions_whenPageAndSizeAreNull_usesDefaultValues() {
        PageResult<Transaction> pageResult = new PageResult<>(List.of(), 0, 0, 0, 10);
        TransactionPage transactionPage = new TransactionPage();

        when(transactionUseCase.listTransactions(null, null, null, null, 0, 10)).thenReturn(pageResult);
        when(transactionRestMapper.toPageDto(pageResult)).thenReturn(transactionPage);

        ResponseEntity<TransactionPage> response = controller.listTransactions(null, null, null, null, null, null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(transactionPage, response.getBody());
        verify(transactionUseCase).listTransactions(null, null, null, null, 0, 10);
        verify(transactionRestMapper).toPageDto(pageResult);
    }

    @Test
    void listTransactions_withExplicitFiltersAndPagination_forwardsAllValues() {
        OffsetDateTime fromDate = OffsetDateTime.parse("2026-01-01T00:00:00Z");
        OffsetDateTime toDate = OffsetDateTime.parse("2026-01-31T23:59:59Z");

        PageResult<Transaction> pageResult = new PageResult<>(List.of(), 1, 1, 2, 25);
        TransactionPage transactionPage = new TransactionPage();

        when(transactionUseCase.listTransactions("ten", "shop", fromDate, toDate, 2, 25)).thenReturn(pageResult);
        when(transactionRestMapper.toPageDto(pageResult)).thenReturn(transactionPage);

        ResponseEntity<TransactionPage> response = controller.listTransactions("ten", "shop", fromDate, toDate, 2, 25);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(transactionPage, response.getBody());
        verify(transactionUseCase).listTransactions("ten", "shop", fromDate, toDate, 2, 25);
    }

    @Test
    void createTransaction_returnsCreatedResponseWithMappedBody() {
        TransactionCreateRequest request = new TransactionCreateRequest();
        Transaction toCreate = Transaction.builder().commerceName("store").build();
        Transaction saved = Transaction.builder().id(100L).commerceName("store").build();
        TransactionResponse dto = new TransactionResponse();

        when(transactionRestMapper.toDomain(request)).thenReturn(toCreate);
        when(transactionUseCase.createTransaction(toCreate)).thenReturn(saved);
        when(transactionRestMapper.toDto(saved)).thenReturn(dto);

        ResponseEntity<TransactionResponse> response = controller.createTransaction(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(dto, response.getBody());
        verify(transactionRestMapper).toDomain(request);
        verify(transactionUseCase).createTransaction(toCreate);
        verify(transactionRestMapper).toDto(saved);
    }
}