package com.tenpista.challenge.backend.domain.exception;

public class InvalidBusinessRuleException extends RuntimeException {
    public InvalidBusinessRuleException(String message) {
        super(message);
    }
}
