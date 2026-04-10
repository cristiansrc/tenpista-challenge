package com.tenpista.challenge.backend.infrastructure.adapter.output.db.adapter;

import com.tenpista.challenge.backend.domain.model.User;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.UserEntity;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.mapper.UserPersistenceMapper;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserPersistenceAdapterTest {

    @Mock
    private UserJpaRepository repository;

    @Mock
    private UserPersistenceMapper mapper;

    @InjectMocks
    private UserPersistenceAdapter adapter;

    @Test
    void findByUsername_whenUserExists_mapsAndReturnsDomainUser() {
        UserEntity entity = UserEntity.builder().id(10L).username("admin@tenpo.cl").build();
        User domainUser = User.builder().id(10L).username("admin@tenpo.cl").build();

        when(repository.findByUsername("admin@tenpo.cl")).thenReturn(Optional.of(entity));
        when(mapper.toDomain(entity)).thenReturn(domainUser);

        Optional<User> result = adapter.findByUsername("admin@tenpo.cl");

        assertTrue(result.isPresent());
        assertSame(domainUser, result.get());
        verify(mapper).toDomain(entity);
    }

    @Test
    void findByUsername_whenUserDoesNotExist_returnsEmptyOptional() {
        when(repository.findByUsername("unknown@tenpo.cl")).thenReturn(Optional.empty());

        Optional<User> result = adapter.findByUsername("unknown@tenpo.cl");

        assertFalse(result.isPresent());
        verify(mapper, never()).toDomain(org.mockito.ArgumentMatchers.any(UserEntity.class));
    }
}