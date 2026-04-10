package com.tenpista.challenge.backend.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    @Test
    void generateToken_andExtractUsername_withValidConfiguration_worksCorrectly() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "this-is-a-long-secret-key-with-more-than-32-bytes");
        ReflectionTestUtils.setField(jwtService, "expiration", 60_000L);

        String token = jwtService.generateToken("admin@tenpo.cl");

        assertTrue(jwtService.isTokenValid(token));
        assertEquals("admin@tenpo.cl", jwtService.extractUsername(token));
    }

    @Test
    void isTokenValid_whenTokenIsMalformed_returnsFalse() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "this-is-a-long-secret-key-with-more-than-32-bytes");
        ReflectionTestUtils.setField(jwtService, "expiration", 60_000L);

        assertFalse(jwtService.isTokenValid("not-a-jwt"));
    }

    @Test
    void isTokenValid_whenTokenIsExpired_returnsFalse() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "this-is-a-long-secret-key-with-more-than-32-bytes");
        ReflectionTestUtils.setField(jwtService, "expiration", -1L);

        String expiredToken = jwtService.generateToken("admin@tenpo.cl");

        assertFalse(jwtService.isTokenValid(expiredToken));
    }

    @Test
    void isTokenValid_whenSignedWithDifferentSecret_returnsFalse() {
        JwtService signer = new JwtService();
        ReflectionTestUtils.setField(signer, "secret", "this-is-a-long-secret-key-with-more-than-32-bytes");
        ReflectionTestUtils.setField(signer, "expiration", 60_000L);

        JwtService validator = new JwtService();
        ReflectionTestUtils.setField(validator, "secret", "another-long-secret-key-with-more-than-32-bytes");
        ReflectionTestUtils.setField(validator, "expiration", 60_000L);

        String token = signer.generateToken("admin@tenpo.cl");

        assertFalse(validator.isTokenValid(token));
    }

    @Test
    void generateToken_whenSecretIsShort_stillCreatesValidToken() {
        JwtService jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secret", "short-secret");
        ReflectionTestUtils.setField(jwtService, "expiration", 60_000L);

        String token = jwtService.generateToken("admin@tenpo.cl");

        assertTrue(jwtService.isTokenValid(token));
        assertEquals("admin@tenpo.cl", jwtService.extractUsername(token));
    }
}
