package com.tenpista.challenge.backend.domain.exception;

public class AuthException extends RuntimeException {
    public AuthException(String message) {
        super(message);
    }
}
