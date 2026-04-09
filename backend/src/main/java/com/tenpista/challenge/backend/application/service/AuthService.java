package com.tenpista.challenge.backend.application.service;

import com.tenpista.challenge.backend.domain.exception.AuthException;
import com.tenpista.challenge.backend.domain.model.User;
import com.tenpista.challenge.backend.domain.port.input.AuthUseCase;
import com.tenpista.challenge.backend.domain.port.output.UserRepositoryPort;
import com.tenpista.challenge.backend.infrastructure.config.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthUseCase, UserDetailsService {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public String login(String username, String password) {
        User user = userRepositoryPort.findByUsername(username)
                .orElseThrow(() -> new AuthException("Credenciales inválidas."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new AuthException("Credenciales inválidas.");
        }

        return jwtService.generateToken(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepositoryPort.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRole())
                .build();
    }
}
