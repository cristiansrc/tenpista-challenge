package com.tenpista.challenge.backend.domain.port.output;

import com.tenpista.challenge.backend.domain.model.User;

import java.util.Optional;

public interface UserRepositoryPort {
    Optional<User> findByUsername(String username);
}
