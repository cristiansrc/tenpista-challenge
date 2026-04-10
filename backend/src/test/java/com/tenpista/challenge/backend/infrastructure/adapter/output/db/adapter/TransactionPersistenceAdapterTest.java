package com.tenpista.challenge.backend.infrastructure.adapter.output.db.adapter;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.TransactionEntity;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.mapper.TransactionPersistenceMapper;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository.TransactionJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

import java.time.OffsetDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionPersistenceAdapterTest {

    @Mock
    private TransactionJpaRepository repository;

    @Mock
    private TransactionPersistenceMapper mapper;

    @InjectMocks
    private TransactionPersistenceAdapter adapter;

    @Test
    void findAll_withoutFilters_returnsMappedPageResultWithExpectedPagination() {
        TransactionEntity entity1 = TransactionEntity.builder().id(1L).build();
        TransactionEntity entity2 = TransactionEntity.builder().id(2L).build();

        Transaction domain1 = Transaction.builder().id(1L).build();
        Transaction domain2 = Transaction.builder().id(2L).build();

        Page<TransactionEntity> entityPage = new PageImpl<>(List.of(entity1, entity2), Pageable.ofSize(5).withPage(1), 12);

        when(repository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(entityPage);
        when(mapper.toDomain(entity1)).thenReturn(domain1);
        when(mapper.toDomain(entity2)).thenReturn(domain2);

        PageResult<Transaction> result = adapter.findAll(null, null, null, null, 1, 5);

        ArgumentCaptor<Pageable> pageableCaptor = ArgumentCaptor.forClass(Pageable.class);
        verify(repository).findAll(any(Specification.class), pageableCaptor.capture());

        Pageable usedPageable = pageableCaptor.getValue();
        assertEquals(1, usedPageable.getPageNumber());
        assertEquals(5, usedPageable.getPageSize());
        Sort.Order sortOrder = usedPageable.getSort().getOrderFor("transactionDate");
        assertNotNull(sortOrder);
        assertEquals(Sort.Direction.DESC, sortOrder.getDirection());

        assertEquals(2, result.getContent().size());
        assertSame(domain1, result.getContent().get(0));
        assertSame(domain2, result.getContent().get(1));
        assertEquals(12, result.getTotalElements());
        assertEquals(3, result.getTotalPages());
        assertEquals(1, result.getPage());
        assertEquals(5, result.getSize());
    }

    @Test
    void findAll_withAllFilters_appliesSpecificationAndReturnsMappedPageResult() {
        OffsetDateTime fromDate = OffsetDateTime.parse("2026-01-01T00:00:00Z");
        OffsetDateTime toDate = OffsetDateTime.parse("2026-01-31T23:59:59Z");

        TransactionEntity entity = TransactionEntity.builder().id(9L).build();
        Transaction domain = Transaction.builder().id(9L).build();
        Page<TransactionEntity> entityPage = new PageImpl<>(List.of(entity), Pageable.ofSize(10).withPage(0), 1);

        when(repository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(entityPage);
        when(mapper.toDomain(entity)).thenReturn(domain);

        PageResult<Transaction> result = adapter.findAll("TEN", "SHOP", fromDate, toDate, 0, 10);

        ArgumentCaptor<Specification<TransactionEntity>> specificationCaptor = ArgumentCaptor.forClass(Specification.class);
        verify(repository).findAll(specificationCaptor.capture(), any(Pageable.class));

        Specification<TransactionEntity> specification = specificationCaptor.getValue();
        assertNotNull(specification);

        Root<TransactionEntity> root = org.mockito.Mockito.mock(Root.class);
        CriteriaQuery<?> query = org.mockito.Mockito.mock(CriteriaQuery.class);
        CriteriaBuilder cb = org.mockito.Mockito.mock(CriteriaBuilder.class);

        @SuppressWarnings("unchecked")
        Path<String> tenpistaNamePath = org.mockito.Mockito.mock(Path.class);
        @SuppressWarnings("unchecked")
        Path<String> commerceNamePath = org.mockito.Mockito.mock(Path.class);
        @SuppressWarnings("unchecked")
        Path<OffsetDateTime> transactionDatePath = org.mockito.Mockito.mock(Path.class);
        @SuppressWarnings("unchecked")
        Expression<String> tenpistaNameLowerExpr = org.mockito.Mockito.mock(Expression.class);
        @SuppressWarnings("unchecked")
        Expression<String> commerceNameLowerExpr = org.mockito.Mockito.mock(Expression.class);

        Predicate conjunction = org.mockito.Mockito.mock(Predicate.class);
        Predicate tenpistaPredicate = org.mockito.Mockito.mock(Predicate.class);
        Predicate commercePredicate = org.mockito.Mockito.mock(Predicate.class);
        Predicate fromDatePredicate = org.mockito.Mockito.mock(Predicate.class);
        Predicate toDatePredicate = org.mockito.Mockito.mock(Predicate.class);

        when(cb.conjunction()).thenReturn(conjunction);
        when(root.<String>get("tenpistaName")).thenReturn(tenpistaNamePath);
        when(root.<String>get("commerceName")).thenReturn(commerceNamePath);
        when(root.<OffsetDateTime>get("transactionDate")).thenReturn(transactionDatePath);
        when(cb.lower(tenpistaNamePath)).thenReturn(tenpistaNameLowerExpr);
        when(cb.lower(commerceNamePath)).thenReturn(commerceNameLowerExpr);
        when(cb.like(tenpistaNameLowerExpr, "%ten%")).thenReturn(tenpistaPredicate);
        when(cb.like(commerceNameLowerExpr, "%shop%")).thenReturn(commercePredicate);
        when(cb.greaterThanOrEqualTo(transactionDatePath, fromDate)).thenReturn(fromDatePredicate);
        when(cb.lessThanOrEqualTo(transactionDatePath, toDate)).thenReturn(toDatePredicate);

        Predicate predicate = specification.toPredicate(root, query, cb);

        assertNotNull(predicate);
        verify(cb).like(eq(tenpistaNameLowerExpr), eq("%ten%"));
        verify(cb).like(eq(commerceNameLowerExpr), eq("%shop%"));
        verify(cb).greaterThanOrEqualTo(transactionDatePath, fromDate);
        verify(cb).lessThanOrEqualTo(transactionDatePath, toDate);

        assertEquals(1, result.getContent().size());
        assertSame(domain, result.getContent().getFirst());
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void save_mapsTransactionToEntityAndBackToDomain() {
        Transaction transaction = Transaction.builder().id(3L).build();
        TransactionEntity toSave = TransactionEntity.builder().id(3L).build();
        TransactionEntity savedEntity = TransactionEntity.builder().id(4L).build();
        Transaction savedDomain = Transaction.builder().id(4L).build();

        when(mapper.toEntity(transaction)).thenReturn(toSave);
        when(repository.save(toSave)).thenReturn(savedEntity);
        when(mapper.toDomain(savedEntity)).thenReturn(savedDomain);

        Transaction result = adapter.save(transaction);

        assertSame(savedDomain, result);
        verify(mapper).toEntity(transaction);
        verify(repository).save(toSave);
        verify(mapper).toDomain(savedEntity);
    }
}