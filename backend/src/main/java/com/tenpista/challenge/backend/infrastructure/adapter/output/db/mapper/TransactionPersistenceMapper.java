package com.tenpista.challenge.backend.infrastructure.adapter.output.db.mapper;

import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.TransactionEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TransactionPersistenceMapper {
    TransactionEntity toEntity(Transaction transaction);
    Transaction toDomain(TransactionEntity entity);
}
