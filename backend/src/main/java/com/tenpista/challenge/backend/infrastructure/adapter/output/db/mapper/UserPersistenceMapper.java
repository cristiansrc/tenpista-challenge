package com.tenpista.challenge.backend.infrastructure.adapter.output.db.mapper;

import com.tenpista.challenge.backend.domain.model.User;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserPersistenceMapper {
    User toDomain(UserEntity entity);
}
