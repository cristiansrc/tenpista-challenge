package com.tenpista.challenge.backend.infrastructure.config;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.ExceptionHandlingConfigurer;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.DefaultSecurityFilterChain;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.lang.reflect.Method;
import java.util.concurrent.atomic.AtomicReference;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.config.Customizer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SecurityConfigTest {

    @Test
    void authenticationManager_returnsManagerFromConfiguration() throws Exception {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        AuthenticationConfiguration authenticationConfiguration = mock(AuthenticationConfiguration.class);
        AuthenticationManager authenticationManager = mock(AuthenticationManager.class);

        when(authenticationConfiguration.getAuthenticationManager()).thenReturn(authenticationManager);

        AuthenticationManager result = config.authenticationManager(authenticationConfiguration);

        assertNotNull(result);
        assertEquals(authenticationManager, result);
    }

    @Test
    void corsConfigurationSource_returnsExpectedConfiguration() {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        CorsConfigurationSource corsConfigurationSource = config.corsConfigurationSource();

        CorsConfiguration configuration = corsConfigurationSource.getCorsConfiguration(
                new MockHttpServletRequest("GET", "/transactions")
        );

        assertNotNull(configuration);
        assertEquals(5, configuration.getAllowedMethods().size());
        assertTrue(configuration.getAllowedMethods().contains("GET"));
        assertTrue(configuration.getAllowedMethods().contains("POST"));
        assertEquals(1, configuration.getAllowedOriginPatterns().size());
        assertEquals("*", configuration.getAllowedOriginPatterns().getFirst());
        assertEquals(Boolean.TRUE, configuration.getAllowCredentials());
    }

    @Test
    void writeErrorResponse_writesJsonPayloadToServletResponse() throws Exception {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        MockHttpServletResponse response = new MockHttpServletResponse();

        Method method = SecurityConfig.class.getDeclaredMethod(
                "writeErrorResponse",
                jakarta.servlet.http.HttpServletResponse.class,
                int.class,
                String.class,
                String.class
        );
        method.setAccessible(true);
        method.invoke(config, response, 401, "No autenticado", "token inválido");

        String body = response.getContentAsString();

        assertEquals(401, response.getStatus());
        assertTrue(response.getContentType().startsWith("application/json"));
        assertEquals("UTF-8", response.getCharacterEncoding());
        assertTrue(body.contains("\"code\":401"));
        assertTrue(body.contains("\"message\":\"No autenticado\""));
        assertTrue(body.contains("\"details\":"));
        assertTrue(body.contains("\"timestamp\":"));
    }

    @Test
    void securityFilterChain_buildsUsingConfiguredHttpSecurityChain() throws Exception {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        HttpSecurity http = mock(HttpSecurity.class);
        DefaultSecurityFilterChain expectedChain = mock(DefaultSecurityFilterChain.class);
        @SuppressWarnings("unchecked")
        ExceptionHandlingConfigurer<HttpSecurity> exceptionHandlingConfigurer = mock(ExceptionHandlingConfigurer.class);

        AtomicReference<AuthenticationEntryPoint> authenticationEntryPointRef = new AtomicReference<>();
        AtomicReference<AccessDeniedHandler> accessDeniedHandlerRef = new AtomicReference<>();

        doReturn(http).when(http).cors(any());
        doReturn(http).when(http).csrf(any());
        doReturn(http).when(http).sessionManagement(any());
        doReturn(http).when(http).authorizeHttpRequests(any());
        doReturn(http).when(http).exceptionHandling(any());
        doReturn(http).when(http).addFilterBefore(any(), eq(UsernamePasswordAuthenticationFilter.class));
        when(http.build()).thenReturn(expectedChain);

        when(exceptionHandlingConfigurer.authenticationEntryPoint(any(AuthenticationEntryPoint.class))).thenAnswer(invocation -> {
            authenticationEntryPointRef.set(invocation.getArgument(0));
            return exceptionHandlingConfigurer;
        });
        when(exceptionHandlingConfigurer.accessDeniedHandler(any(AccessDeniedHandler.class))).thenAnswer(invocation -> {
            accessDeniedHandlerRef.set(invocation.getArgument(0));
            return exceptionHandlingConfigurer;
        });

        org.mockito.Mockito.doAnswer(invocation -> {
            @SuppressWarnings("unchecked")
            Customizer<ExceptionHandlingConfigurer<HttpSecurity>> customizer = invocation.getArgument(0);
            customizer.customize(exceptionHandlingConfigurer);
            return http;
        }).when(http).exceptionHandling(any());

        SecurityFilterChain result = config.securityFilterChain(http);

        assertEquals(expectedChain, result);

        MockHttpServletResponse unauthorizedResponse = new MockHttpServletResponse();
        authenticationEntryPointRef.get().commence(
                new MockHttpServletRequest(),
                unauthorizedResponse,
                new AuthenticationException("invalid token") {
                }
        );

        MockHttpServletResponse forbiddenResponse = new MockHttpServletResponse();
        accessDeniedHandlerRef.get().handle(
                new MockHttpServletRequest(),
                forbiddenResponse,
                new AccessDeniedException("forbidden")
        );

        assertEquals(401, unauthorizedResponse.getStatus());
        assertTrue(unauthorizedResponse.getContentAsString().contains("No autenticado (token faltante, inválido o expirado)."));
        assertEquals(403, forbiddenResponse.getStatus());
        assertTrue(forbiddenResponse.getContentAsString().contains("El usuario no tiene permisos para esta operación."));
    }

    @Test
    void writeErrorResponse_swallowsExceptionsFromServletWriter() throws Exception {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        jakarta.servlet.http.HttpServletResponse response = mock(jakarta.servlet.http.HttpServletResponse.class);
        PrintWriter writer = new PrintWriter(new StringWriter()) {
            @Override
            public void write(String s) {
                throw new RuntimeException("write failed");
            }
        };

        when(response.getWriter()).thenReturn(writer);

        Method method = SecurityConfig.class.getDeclaredMethod(
                "writeErrorResponse",
                jakarta.servlet.http.HttpServletResponse.class,
                int.class,
                String.class,
                String.class
        );
        method.setAccessible(true);

        method.invoke(config, response, 403, "Sin permiso", "forbidden");

        // No exception expected from invocation because method handles failures internally.
        assertTrue(true);
    }

    @Test
    void sanity_instantiatesConfig() {
        SecurityConfig config = new SecurityConfig(mock(JwtAuthenticationFilter.class));
        assertNotNull(config);
    }
}