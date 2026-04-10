package com.tenpista.challenge.backend.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PasswordConfigTest {

    @Test
    void passwordEncoder_returnsBcryptEncoderThatMatchesEncodedValues() {
        PasswordConfig config = new PasswordConfig();

        PasswordEncoder encoder = config.passwordEncoder();
        String rawPassword = "Tenpista2026!";
        String encoded = encoder.encode(rawPassword);

        assertInstanceOf(BCryptPasswordEncoder.class, encoder);
        assertNotEquals(rawPassword, encoded);
        assertTrue(encoder.matches(rawPassword, encoded));
    }
}