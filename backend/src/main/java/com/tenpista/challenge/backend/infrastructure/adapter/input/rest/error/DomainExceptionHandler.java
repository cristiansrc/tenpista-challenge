package com.tenpista.challenge.backend.infrastructure.adapter.input.rest.error;

import com.tenpista.challenge.backend.domain.exception.AuthException;
import com.tenpista.challenge.backend.domain.exception.EntityNotFoundException;
import com.tenpista.challenge.backend.domain.exception.InvalidBusinessRuleException;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class DomainExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEntityNotFound(EntityNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND,
                ex.getMessage() != null ? ex.getMessage() : "Recurso no encontrado.",
                ex.getMessage());
    }

    @ExceptionHandler(InvalidBusinessRuleException.class)
    public ResponseEntity<ErrorResponse> handleInvalidBusinessRule(InvalidBusinessRuleException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST,
                ex.getMessage() != null ? ex.getMessage() : "Regla de negocio inválida.",
                ex.getMessage());
    }

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuthException(AuthException ex) {
        return buildResponse(HttpStatus.UNAUTHORIZED,
                ex.getMessage() != null ? ex.getMessage() : "Error de autenticación.",
                ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return buildResponse(HttpStatus.BAD_REQUEST, "Validación fallida.", details);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Error inesperado", ex);
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error inesperado.",
                ex.getMessage());
    }

    private ResponseEntity<ErrorResponse> buildResponse(HttpStatus status, String message, String details) {
        log.error("[{}] {}: {}", status.value(), message, details);
        ErrorResponse error = new ErrorResponse()
                .code(status.value())
                .message(message)
                .timestamp(OffsetDateTime.now())
                .details(details);
        return ResponseEntity.status(status).body(error);
    }
}
