package com.tenpista.challenge.backend.infrastructure.adapter.input.rest.mapper;

import com.tenpista.challenge.backend.domain.model.PageResult;
import com.tenpista.challenge.backend.domain.model.Transaction;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionCreateRequest;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionPage;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.TransactionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface TransactionRestMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Transaction toDomain(TransactionCreateRequest request);

    TransactionResponse toDto(Transaction transaction);

    default TransactionPage toPageDto(PageResult<Transaction> pageResult) {
        TransactionPage page = new TransactionPage();
        page.setContent(
                pageResult.getContent().stream()
                        .map(this::toDto)
                        .collect(Collectors.toList())
        );
        page.setTotalElements(pageResult.getTotalElements());
        page.setTotalPages(pageResult.getTotalPages());
        page.setPage(pageResult.getPage());
        page.setSize(pageResult.getSize());
        return page;
    }
}
