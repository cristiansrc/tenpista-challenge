package com.tenpista.challenge.backend.domain.port.input;

public interface AuthUseCase {
    String login(String username, String password);
}
