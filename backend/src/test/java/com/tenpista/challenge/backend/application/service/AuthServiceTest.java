package com.tenpista.challenge.backend.application.service;

import com.tenpista.challenge.backend.domain.exception.AuthException;
import com.tenpista.challenge.backend.domain.model.User;
import com.tenpista.challenge.backend.domain.port.output.UserRepositoryPort;
import com.tenpista.challenge.backend.infrastructure.config.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepositoryPort userRepositoryPort;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    @Test
    void login_whenCredentialsAreValid_returnsJwtToken() {
        User user = User.builder()
                .id(1L)
                .username("admin@tenpo.cl")
                .password("hashed-password")
                .role("ROLE_USER")
                .build();

        when(userRepositoryPort.findByUsername("admin@tenpo.cl")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Tenpista2026!", "hashed-password")).thenReturn(true);
        when(jwtService.generateToken("admin@tenpo.cl")).thenReturn("jwt-token");

        String token = authService.login("admin@tenpo.cl", "Tenpista2026!");

        assertEquals("jwt-token", token);
        verify(userRepositoryPort).findByUsername("admin@tenpo.cl");
        verify(passwordEncoder).matches("Tenpista2026!", "hashed-password");
        verify(jwtService).generateToken("admin@tenpo.cl");
    }

    @Test
    void login_whenUserDoesNotExist_throwsAuthException() {
        when(userRepositoryPort.findByUsername("unknown@tenpo.cl")).thenReturn(Optional.empty());

        AuthException exception = assertThrows(
                AuthException.class,
                () -> authService.login("unknown@tenpo.cl", "any")
        );

        assertEquals("Credenciales inválidas.", exception.getMessage());
        verify(userRepositoryPort).findByUsername("unknown@tenpo.cl");
        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void login_whenPasswordDoesNotMatch_throwsAuthException() {
        User user = User.builder()
                .username("admin@tenpo.cl")
                .password("hashed-password")
                .role("ROLE_USER")
                .build();

        when(userRepositoryPort.findByUsername("admin@tenpo.cl")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong-password", "hashed-password")).thenReturn(false);

        AuthException exception = assertThrows(
                AuthException.class,
                () -> authService.login("admin@tenpo.cl", "wrong-password")
        );

        assertEquals("Credenciales inválidas.", exception.getMessage());
        verify(userRepositoryPort).findByUsername("admin@tenpo.cl");
        verify(passwordEncoder).matches("wrong-password", "hashed-password");
        verifyNoInteractions(jwtService);
    }

    @Test
    void loadUserByUsername_whenUserExists_returnsUserDetails() {
        User user = User.builder()
                .id(1L)
                .username("admin@tenpo.cl")
                .password("hashed-password")
                .role("ROLE_USER")
                .build();

        when(userRepositoryPort.findByUsername("admin@tenpo.cl")).thenReturn(Optional.of(user));

        UserDetails userDetails = authService.loadUserByUsername("admin@tenpo.cl");

        assertEquals("admin@tenpo.cl", userDetails.getUsername());
        assertEquals("hashed-password", userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream().anyMatch(a -> "ROLE_USER".equals(a.getAuthority())));
        verify(userRepositoryPort).findByUsername("admin@tenpo.cl");
    }

    @Test
    void loadUserByUsername_whenUserDoesNotExist_throwsUsernameNotFoundException() {
        when(userRepositoryPort.findByUsername("missing@tenpo.cl")).thenReturn(Optional.empty());

        UsernameNotFoundException exception = assertThrows(
                UsernameNotFoundException.class,
                () -> authService.loadUserByUsername("missing@tenpo.cl")
        );

        assertEquals("Usuario no encontrado: missing@tenpo.cl", exception.getMessage());
        verify(userRepositoryPort).findByUsername("missing@tenpo.cl");
    }
}
