package com.tenpista.challenge.backend.infrastructure.adapter.output.db.adapter;

import com.tenpista.challenge.backend.domain.model.User;
import com.tenpista.challenge.backend.domain.port.output.UserRepositoryPort;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.mapper.UserPersistenceMapper;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final UserJpaRepository repository;
    private final UserPersistenceMapper mapper;

    @Override
    public Optional<User> findByUsername(String username) {
        return repository.findByUsername(username).map(mapper::toDomain);
    }
}
