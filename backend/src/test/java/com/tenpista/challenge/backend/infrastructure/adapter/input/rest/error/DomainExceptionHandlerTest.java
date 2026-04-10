package com.tenpista.challenge.backend.infrastructure.adapter.input.rest.error;

import com.tenpista.challenge.backend.domain.exception.AuthException;
import com.tenpista.challenge.backend.domain.exception.EntityNotFoundException;
import com.tenpista.challenge.backend.domain.exception.InvalidBusinessRuleException;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.core.MethodParameter;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class DomainExceptionHandlerTest {

    private final DomainExceptionHandler handler = new DomainExceptionHandler();

    @Test
    void handleEntityNotFound_returnsNotFoundErrorResponse() {
        EntityNotFoundException ex = new EntityNotFoundException("No existe");

        ResponseEntity<ErrorResponse> response = handler.handleEntityNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getCode());
        assertEquals("No existe", response.getBody().getMessage());
        assertEquals("No existe", response.getBody().getDetails());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void handleInvalidBusinessRule_returnsBadRequestErrorResponse() {
        InvalidBusinessRuleException ex = new InvalidBusinessRuleException("Regla inválida");

        ResponseEntity<ErrorResponse> response = handler.handleInvalidBusinessRule(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getCode());
        assertEquals("Regla inválida", response.getBody().getMessage());
        assertEquals("Regla inválida", response.getBody().getDetails());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void handleAuthException_returnsUnauthorizedErrorResponse() {
        AuthException ex = new AuthException("Credenciales inválidas");

        ResponseEntity<ErrorResponse> response = handler.handleAuthException(ex);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(401, response.getBody().getCode());
        assertEquals("Credenciales inválidas", response.getBody().getMessage());
        assertEquals("Credenciales inválidas", response.getBody().getDetails());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void handleValidation_returnsJoinedFieldErrors() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "username", "must not be blank"));
        bindingResult.addError(new FieldError("request", "password", "must not be blank"));

        Method method = DomainExceptionHandlerTest.class.getDeclaredMethod("sampleMethod", String.class);
        MethodParameter methodParameter = new MethodParameter(method, 0);
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(methodParameter, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getCode());
        assertEquals("Validación fallida.", response.getBody().getMessage());
        assertEquals("username: must not be blank, password: must not be blank", response.getBody().getDetails());
        assertNotNull(response.getBody().getTimestamp());
    }

    @Test
    void handleGeneral_returnsInternalServerErrorResponse() {
        Exception ex = new Exception("fallo inesperado");

        ResponseEntity<ErrorResponse> response = handler.handleGeneral(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getCode());
        assertEquals("Ocurrió un error inesperado.", response.getBody().getMessage());
        assertEquals("fallo inesperado", response.getBody().getDetails());
        assertNotNull(response.getBody().getTimestamp());
    }

    @SuppressWarnings("unused")
    private void sampleMethod(String value) {
    }
}