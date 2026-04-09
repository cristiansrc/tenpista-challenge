package com.tenpista.challenge.backend.infrastructure.adapter.output.db.repository;

import com.tenpista.challenge.backend.infrastructure.adapter.output.db.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserJpaRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
}
