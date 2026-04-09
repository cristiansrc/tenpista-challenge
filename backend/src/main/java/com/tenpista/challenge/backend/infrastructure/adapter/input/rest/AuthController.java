package com.tenpista.challenge.backend.infrastructure.adapter.input.rest;

import com.tenpista.challenge.backend.domain.port.input.AuthUseCase;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.api.AuthApi;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.LoginRequest;
import com.tenpista.challenge.backend.infrastructure.adapter.input.rest.dto.LoginResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController implements AuthApi {

    private final AuthUseCase authUseCase;

    @Override
    public ResponseEntity<LoginResponse> login(LoginRequest loginRequest) {
        String token = authUseCase.login(loginRequest.getUsername(), loginRequest.getPassword());
        LoginResponse response = new LoginResponse()
                .accessToken(token)
                .tokenType("Bearer");
        return ResponseEntity.ok(response);
    }
}
