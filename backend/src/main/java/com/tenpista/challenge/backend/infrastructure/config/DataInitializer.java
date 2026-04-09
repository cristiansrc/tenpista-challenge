package com.tenpista.challenge.backend.infrastructure.config;

import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.UserEntity;
import com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository.UserJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Inicializa el usuario administrador por defecto si no existe ningún usuario.
 * Credenciales: admin@tenpo.cl / Tenpista2026!
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserJpaRepository userJpaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userJpaRepository.count() == 0) {
            UserEntity admin = UserEntity.builder()
                    .username("admin@tenpo.cl")
                    .password(passwordEncoder.encode("Tenpista2026!"))
                    .role("ROLE_USER")
                    .build();
            userJpaRepository.save(admin);
            log.info("Usuario por defecto creado: admin@tenpo.cl");
        }
    }
}
