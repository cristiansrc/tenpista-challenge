package com.tenpista.challenge.backend.infrastructure.adapter.output.db.adapter;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.domain.port.output.TransactionRepositoryPort;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.TransactionEntity;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.mapper.TransactionPersistenceMapper;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository.TransactionJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Component
@RequiredArgsConstructor
public class TransactionPersistenceAdapter implements TransactionRepositoryPort {

    private final TransactionJpaRepository repository;
    private final TransactionPersistenceMapper mapper;

    @Override
        public PageResult<Transaction> findAll(
            String tenpistaName,
            String commerceName,
            OffsetDateTime fromDate,
            OffsetDateTime toDate,
            int page,
            int size
        ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate"));

        Specification<TransactionEntity> specification = (root, query, cb) -> cb.conjunction();

        if (tenpistaName != null && !tenpistaName.isBlank()) {
            String normalized = tenpistaName.toLowerCase();
            specification = specification.and((root, query, cb) ->
                cb.like(cb.lower(root.get("tenpistaName")), "%" + normalized + "%")
            );
        }

        if (commerceName != null && !commerceName.isBlank()) {
            String normalized = commerceName.toLowerCase();
            specification = specification.and((root, query, cb) ->
                cb.like(cb.lower(root.get("commerceName")), "%" + normalized + "%")
            );
        }

        if (fromDate != null) {
            specification = specification.and((root, query, cb) ->
                cb.greaterThanOrEqualTo(root.get("transactionDate"), fromDate)
            );
        }

        if (toDate != null) {
            specification = specification.and((root, query, cb) ->
                cb.lessThanOrEqualTo(root.get("transactionDate"), toDate)
            );
        }

        Page<TransactionEntity> entities = repository.findAll(specification, pageable);

        return new PageResult<>(
                entities.getContent().stream().map(mapper::toDomain).toList(),
                entities.getTotalElements(),
                entities.getTotalPages(),
                entities.getNumber(),
                entities.getSize()
        );
    }

    @Override
    public Transaction save(Transaction transaction) {
        TransactionEntity entity = mapper.toEntity(transaction);
        return mapper.toDomain(repository.save(entity));
    }
}
