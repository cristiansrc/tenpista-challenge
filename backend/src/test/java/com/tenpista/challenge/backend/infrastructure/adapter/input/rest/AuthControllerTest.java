package com.tenpista.challenge.backend.infrastructure.adapter.input.rest;

import com.tenpista.challenge.backend.domain.port.input.AuthUseCase;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.LoginRequest;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.LoginResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthUseCase authUseCase;

    @InjectMocks
    private AuthController controller;

    @Test
    void login_returnsBearerTokenResponse() {
        LoginRequest request = new LoginRequest()
                .username("admin@tenpo.cl")
                .password("Tenpista2026!");

        when(authUseCase.login("admin@tenpo.cl", "Tenpista2026!")).thenReturn("jwt-token");

        ResponseEntity<LoginResponse> response = controller.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token", response.getBody().getAccessToken());
        assertEquals("Bearer", response.getBody().getTokenType());
        verify(authUseCase).login("admin@tenpo.cl", "Tenpista2026!");
    }
}