package com.tenpista.challenge.backend.infrastructure.config;

import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.UserEntity;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository.UserJpaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.ApplicationArguments;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserJpaRepository userJpaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ApplicationArguments applicationArguments;

    @InjectMocks
    private DataInitializer dataInitializer;

    @Test
    void run_whenNoUsersExist_createsDefaultAdminUser() {
        when(userJpaRepository.count()).thenReturn(0L);
        when(passwordEncoder.encode("Tenpista2026!")).thenReturn("encoded-password");

        dataInitializer.run(applicationArguments);

        ArgumentCaptor<UserEntity> userCaptor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userJpaRepository).save(userCaptor.capture());

        UserEntity savedUser = userCaptor.getValue();
        assertNotNull(savedUser);
        assertEquals("admin@tenpo.cl", savedUser.getUsername());
        assertEquals("encoded-password", savedUser.getPassword());
        assertEquals("ROLE_USER", savedUser.getRole());
    }

    @Test
    void run_whenUsersAlreadyExist_doesNotCreateAdminUser() {
        when(userJpaRepository.count()).thenReturn(2L);

        dataInitializer.run(applicationArguments);

        verify(userJpaRepository, never()).save(org.mockito.ArgumentMatchers.any(UserEntity.class));
        verify(passwordEncoder, never()).encode("Tenpista2026!");
    }
}
