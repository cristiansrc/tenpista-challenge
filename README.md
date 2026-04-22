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
- **Documentación Interactiva:** [http://localhost:8080/v1/api/swagger-ui](http://localhost:8080/v1/api/swagger-ui)

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

**Decisión:** organizar el backend en capas domain → application → infrastructure con dependencias siempre apuntando hacia el dominio.

**Por qué:** el dominio de negocio (reglas de validación, modelos) queda completamente aislado de Spring, JPA e HTTP. Esto permite cambiar la base de datos o el framework web sin tocar una sola línea de lógica de negocio. También facilita el testing unitario del dominio sin necesidad de levantar el contexto de Spring.


### 2. API Design First con OpenAPI Generator

**Decisión:** definir el contrato en `openapi.yaml` antes de escribir código. El plugin `openapi-generator` de Gradle genera las interfaces Java en compile-time.

**Por qué:** garantiza que los controladores nunca se desvíen del contrato documentado. Si el YAML cambia, el código que no cumpla el nuevo contrato rompe en compilación, no en producción. Además, la documentación Swagger UI se genera desde la misma fuente de verdad, eliminando la posibilidad de que docs y código se desincronicen.


### 3. Autenticación agregada como mejora de seguridad (JWT)

**Decisión:** agregar login con JWT autogestionado (JJWT 0.12.x + Spring Security) como capa adicional de seguridad, aunque el challenge no lo exige explícitamente.

**Por qué:** el enunciado se centra en CRUD/listado de transacciones, validaciones y calidad técnica, sin requerir autenticación. Se incorporó login para proteger endpoints sensibles, simular un escenario más realista y demostrar manejo de seguridad en API REST sin depender de un proveedor externo.

**Alcance de la decisión:** se prefirió JWT autogestionado sobre OAuth2 para mantener bajo el overhead operativo del challenge. OAuth2 (Keycloak/Auth0) era válido, pero sobredimensionado para este contexto y tiempo de entrega.

**Detalle relevante:** se extrajo `PasswordEncoder` a una clase `PasswordConfig` separada para romper la dependencia circular `SecurityConfig → JwtAuthFilter → AuthService (UserDetailsService) → PasswordEncoder ← SecurityConfig`.


### 4. `PageResult<T>` propio en el dominio

**Decisión:** usar un POJO genérico `PageResult<T>` en las interfaces del dominio en lugar de `org.springframework.data.domain.Page<T>`.

**Por qué:** Spring's `Page<T>` es una clase de infraestructura. Usarla en los puertos del dominio introduciría una dependencia de Spring Data en la capa de negocio, rompiendo el principio de la arquitectura hexagonal. `PageResult<T>` es un POJO puro sin dependencias externas.


### 5. Flyway para migraciones + `ddl-auto: validate`

**Decisión:** usar Flyway para gestionar el esquema de la base de datos y configurar Hibernate en modo `validate`.

**Por qué:** `ddl-auto: create` o `update` son convenientes en desarrollo pero peligrosos en producción. Flyway da control total sobre cada cambio de esquema, con historial versionado y reproducible. El modo `validate` hace que la aplicación falle al arrancar si las entities no coinciden con la base de datos, evitando sorpresas en runtime.

**Seed de usuario con `ApplicationRunner`:** la contraseña se hashea con BCrypt, lo que requiere ejecutar código de Spring. No es posible pre-computar un hash BCrypt en una migración SQL sin hardcodear el valor, por lo que se usa un `DataInitializer` que crea el usuario admin al arrancar si no existe ninguno.


### 6. MapStruct para mapeo entre capas

**Decisión:** usar MapStruct en lugar de mapeo manual o ModelMapper.

**Por qué:** MapStruct genera el código de mapeo en compile-time. Es type-safe (los errores de mapeo aparecen en compilación), tiene cero overhead en runtime (no usa reflection) y es considerablemente más rápido que ModelMapper en benchmarks. Los mappers se detectan fácilmente en el código al ser clases generadas concretas.


### 7. Vite en lugar de Next.js para el frontend

**Decisión:** React SPA con Vite como bundler, servida con nginx.

**Por qué:** la aplicación no requiere SSR ni SSG — es un panel de administración con autenticación donde el contenido es completamente dinámico y privado. Next.js añadiría complejidad de servidor innecesaria. Vite ofrece HMR instantáneo en desarrollo y produce un bundle estático que nginx sirve de forma óptima. El Dockerfile resultante es más simple y el contenedor de producción es más liviano.


### 8. Refine v5 para el frontend

**Decisión:** usar Refine como meta-framework sobre React en lugar de implementar data fetching, paginación y auth guards desde cero.

**Por qué:** Refine elimina el boilerplate repetitivo de aplicaciones CRUD: paginación server-side, estado de loading/error, guards de autenticación, sincronización de filtros con la URL. Se integra nativamente con TanStack Table para paginación server-side y con React Router para routing. El `DataProvider` y el `AuthProvider` son contratos simples que se implementan una vez y se reutilizan en toda la app.


### 9. Virtual Threads (Java 21)

**Decisión:** activar virtual threads con `spring.threads.virtual.enabled: true`.

**Por qué:** las operaciones del backend son mayoritariamente I/O-bound (queries a base de datos, validaciones). Los virtual threads de Project Loom permiten manejar muchas más solicitudes concurrentes sin cambiar una sola línea de código de negocio, usando la misma API de threading bloqueante pero con el scheduler del JVM administrando el contexto de forma eficiente.


### 10. Spring Boot (4.0)

**Decisión:** usar la versión 4.0 de Spring Boot.

**Por qué:** Se optó por Spring Boot 4.0 para aprovechar el soporte nativo de primera clase para Virtual Threads y las optimizaciones de Spring Framework 7, garantizando un manejo de concurrencia eficiente con un consumo de recursos mínimo en entornos de contenedores.


### 11. Estandarización de errores con `DomainExceptionHandler`

**Decisión:** centralizar el manejo de excepciones de negocio y validación en una clase `DomainExceptionHandler` anotada con `@RestControllerAdvice`.

**Por qué:** permite devolver respuestas de error consistentes (status code, mensaje y estructura), desacoplando los controladores de la lógica de manejo de excepciones. Esto mejora la mantenibilidad, evita duplicación de bloques `try/catch` y hace más predecible el contrato de errores para el frontend y para consumidores de la API.


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
