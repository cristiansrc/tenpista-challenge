# Tenpista Challenge — Fullstack

Aplicación robusta para el registro y consulta de transacciones financieras. Construida con **Java 21 + Spring Boot 4** (Backend) y **React 18 + Vite + Refine** (Frontend) bajo una arquitectura de **Micro-Frontends** y **Arquitectura Hexagonal**, orquestados íntegramente con Docker.

---

## Credenciales de Acceso

| Campo | Valor |
|---|---|
| **Username** | `admin@tenpo.cl` |
| **Password** | `Tenpista2026!` |

---

## Despliegue con Docker (Recomendado)

El proyecto está diseñado para levantarse con un solo comando, incluyendo la base de datos (PostgreSQL), el Backend, el Micro-Frontend de transacciones y el Shell principal.

```bash
docker compose up --build -d
```

### URLs de Acceso:
- **Frontend (App Principal):** [http://localhost](http://localhost)
- **API REST (Base):** [http://localhost:8080/v1/api](http://localhost:8080/v1/api)
- **Documentación Interactiva:** [http://localhost:8080/v1/api/api-docs/swagger-ui](http://localhost:8080/v1/api/api-docs/swagger-ui)

---

## Arquitectura y Tecnologías

El sistema utiliza un enfoque moderno de desacoplamiento total tanto en el servidor como en el cliente:

1.  **Backend (Hexagonal + API Design First):**
    - El contrato se define en **OpenAPI (YAML)** y el código se genera automáticamente, garantizando sincronización total entre docs y API.
    - Sigue el patrón **Ports & Adapters**, aislando la lógica de negocio de la infraestructura (Spring, JPA).
    - **Stack:** Java 21 (Virtual Threads), Spring Boot 4, Spring Security (JWT), PostgreSQL, Flyway, MapStruct.

2.  **Frontend (Micro-Frontends + Module Federation):**
    - Dividido en un **Shell** (Auth, Layout, Routing) y un **MFE de Transacciones** independiente.
    - Comunicación en runtime mediante **Module Federation** compartiendo dependencias críticas como singletons (React, Refine core).
    - **Stack:** React 18, Vite, Refine v5 (Data fetching & Auth), Tailwind CSS, shadcn/ui, Vitest.

---

## Decisiones Técnicas

### 1. Arquitectura Hexagonal (Ports & Adapters)
Se organizó el backend en capas *domain → application → infrastructure*. El dominio de negocio es puro y no conoce nada de Spring o JPA, lo que permite cambiar detalles técnicos o frameworks sin riesgo, además de facilitar un testing unitario exhaustivo.

### 2. API Design First con OpenAPI Generator
El contrato es la única fuente de verdad. Si el YAML cambia, el código que no lo cumpla rompe en compilación. Esto elimina errores de integración entre el frontend y el backend y mantiene la documentación Swagger siempre actualizada.

### 3. Micro-Frontend con Module Federation
Separar la lógica de transacciones en un MFE independiente permite que el módulo evolucione, se pruebe y se despliegue sin afectar al resto de la aplicación (Shell). Se comparten dependencias como singletons para evitar conflictos de estado y reducir el tamaño de carga.

### 4. Virtual Threads (Java 21)
Se activaron hilos virtuales para manejar las operaciones I/O-bound (DB, validaciones) de forma ultra-eficiente, permitiendo una alta concurrencia con un consumo mínimo de recursos.

### 5. Refine v5 para Productividad
Se utilizó Refine para manejar el boilerplate de aplicaciones administrativas (paginación server-side, sincronización de filtros con URL, guards de auth), permitiendo enfocarse 100% en la lógica de negocio y la UX.

---

## Pruebas y Cobertura

El proyecto mantiene estándares de calidad rigurosos con cobertura automatizada:

| Módulo | Lines | Branches |
|---|---:|---:|
| **Backend** | **100.00%** | 100.00% |
| **MFE Transactions** | **98.81%** | 91.62% |
| **Frontend (Shell)** | **96.96%** | 92.02% |

> **Nota:** Se utiliza **H2 (en memoria)** para los tests del backend y **Vitest** para el frontend, asegurando que cada archivo crítico supere el 80% de cobertura individual.

---

## Estructura del Proyecto

```text
tenpista-challenge/
├── backend/            # API REST (Arquitectura Hexagonal)
├── frontend/           # Shell Principal (Layout + Orquestación)
├── mfe-transactions/   # Micro-Frontend de Transacciones (Independiente)
├── docker-compose.yml  # Orquestación de servicios
└── .env                # Variables de entorno preconfiguradas
```

---

## Reglas de Negocio
- El monto de las transacciones debe ser positivo (CLP).
- La fecha de transacción no puede ser futura.
- El filtrado por rango de fechas valida que `fromDate <= toDate`.
- Todos los endpoints de transacciones están protegidos por **JWT**.
