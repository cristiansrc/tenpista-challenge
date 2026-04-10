package com.tenpista.challenge.backend.application.service;

import com.tenpista.challenge.backend.domain.exception.InvalidBusinessRuleException;
import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.domain.port.output.TransactionRepositoryPort;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepositoryPort transactionRepositoryPort;

    @InjectMocks
    private TransactionService transactionService;

    @Test
    void listTransactions_whenDateRangeIsValid_returnsRepositoryResult() {
        OffsetDateTime fromDate = OffsetDateTime.parse("2026-04-01T00:00:00Z");
        OffsetDateTime toDate = OffsetDateTime.parse("2026-04-09T23:59:59Z");
        PageResult<Transaction> expected = new PageResult<>(List.of(), 0, 0, 0, 10);

        when(transactionRepositoryPort.findAll("Cristian", "Starbucks", fromDate, toDate, 0, 10))
                .thenReturn(expected);

        PageResult<Transaction> result = transactionService.listTransactions(
                "Cristian", "Starbucks", fromDate, toDate, 0, 10
        );

        assertSame(expected, result);
        verify(transactionRepositoryPort).findAll("Cristian", "Starbucks", fromDate, toDate, 0, 10);
    }

    @Test
    void listTransactions_whenFromDateIsAfterToDate_throwsInvalidBusinessRuleException() {
        OffsetDateTime fromDate = OffsetDateTime.parse("2026-04-10T00:00:00Z");
        OffsetDateTime toDate = OffsetDateTime.parse("2026-04-09T00:00:00Z");

        InvalidBusinessRuleException exception = assertThrows(
                InvalidBusinessRuleException.class,
                () -> transactionService.listTransactions("Cristian", "Starbucks", fromDate, toDate, 0, 10)
        );

        assertEquals("El rango de fechas es inválido: fromDate debe ser menor o igual a toDate.", exception.getMessage());
        verifyNoInteractions(transactionRepositoryPort);
    }

    @Test
    void createTransaction_whenAmountIsNull_throwsInvalidBusinessRuleException() {
        Transaction transaction = Transaction.builder()
                .amount(null)
                .transactionDate(OffsetDateTime.now())
                .build();

        InvalidBusinessRuleException exception = assertThrows(
                InvalidBusinessRuleException.class,
                () -> transactionService.createTransaction(transaction)
        );

        assertEquals("El monto debe ser mayor a 0.", exception.getMessage());
        verifyNoInteractions(transactionRepositoryPort);
    }

    @Test
    void createTransaction_whenAmountIsZero_throwsInvalidBusinessRuleException() {
        Transaction transaction = Transaction.builder()
                .amount(0)
                .transactionDate(OffsetDateTime.now())
                .build();

        InvalidBusinessRuleException exception = assertThrows(
                InvalidBusinessRuleException.class,
                () -> transactionService.createTransaction(transaction)
        );

        assertEquals("El monto debe ser mayor a 0.", exception.getMessage());
        verifyNoInteractions(transactionRepositoryPort);
    }

    @Test
    void createTransaction_whenDateIsNull_throwsInvalidBusinessRuleException() {
        Transaction transaction = Transaction.builder()
                .amount(5000)
                .transactionDate(null)
                .build();

        InvalidBusinessRuleException exception = assertThrows(
                InvalidBusinessRuleException.class,
                () -> transactionService.createTransaction(transaction)
        );

        assertEquals("La fecha de transacción es requerida.", exception.getMessage());
        verifyNoInteractions(transactionRepositoryPort);
    }

    @Test
    void createTransaction_whenDateIsFuture_throwsInvalidBusinessRuleException() {
        Transaction transaction = Transaction.builder()
                .amount(5000)
                .transactionDate(OffsetDateTime.now().plusMinutes(1))
                .build();

        InvalidBusinessRuleException exception = assertThrows(
                InvalidBusinessRuleException.class,
                () -> transactionService.createTransaction(transaction)
        );

        assertEquals("La fecha de transacción no puede ser futura.", exception.getMessage());
        verifyNoInteractions(transactionRepositoryPort);
    }

    @Test
    void createTransaction_whenTransactionIsValid_savesAndReturnsTransaction() {
        Transaction transaction = Transaction.builder()
                .amount(5000)
                .commerceName("Starbucks")
                .tenpistaName("Cristian")
                .transactionDate(OffsetDateTime.now().minusMinutes(10))
                .build();

        Transaction saved = Transaction.builder()
                .id(1L)
                .amount(transaction.getAmount())
                .commerceName(transaction.getCommerceName())
                .tenpistaName(transaction.getTenpistaName())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(OffsetDateTime.now())
                .build();

        when(transactionRepositoryPort.save(transaction)).thenReturn(saved);

        Transaction result = transactionService.createTransaction(transaction);

        assertSame(saved, result);
        verify(transactionRepositoryPort).save(transaction);
    }
}
