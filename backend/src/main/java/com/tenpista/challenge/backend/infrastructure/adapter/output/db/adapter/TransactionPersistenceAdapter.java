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
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionPersistenceAdapter implements TransactionRepositoryPort {

    private final TransactionJpaRepository repository;
    private final TransactionPersistenceMapper mapper;

    @Override
    public PageResult<Transaction> findAll(String tenpistaName, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "transactionDate"));

        Page<TransactionEntity> entities = (tenpistaName != null && !tenpistaName.isBlank())
                ? repository.findByTenpistaNameContainingIgnoreCase(tenpistaName, pageable)
                : repository.findAll(pageable);

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
