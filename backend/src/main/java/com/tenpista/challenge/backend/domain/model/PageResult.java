package com.tenpista.challenge.backend.domain.model;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

/**
 * Contenedor de resultado paginado genérico del dominio.
 * No depende de Spring Data para mantener el dominio libre de infraestructura.
 */
@Data
@AllArgsConstructor
public class PageResult<T> {
    private List<T> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
}
