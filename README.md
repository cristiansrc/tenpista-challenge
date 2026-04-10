# Tenpista Challenge — Fullstack

Aplicación fullstack para el registro y consulta de transacciones financieras de Tenpistas. Construida con **Java 21 + Spring Boot 4** en el backend y **React 18 + Vite + Refine** en el frontend, orquestados con Docker Compose.

---

## Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
  - [API Design First](#api-design-first)
  - [Arquitectura Hexagonal (Backend)](#arquitectura-hexagonal-backend)
  - [Estructura Frontend](#estructura-frontend)
- [Tecnologías](#tecnologías)
- [Principios SOLID en el Proyecto](#principios-solid-en-el-proyecto)
- [Automatización y Código Generado](#automatización-y-código-generado)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Despliegue con Docker](#despliegue-con-docker)
- [Desarrollo Local](#desarrollo-local)
- [Pruebas y Cobertura](#pruebas-y-cobertura)
  - [Reporte de Cobertura](#reporte-de-cobertura)
  - [Perfil de Pruebas Backend (H2)](#perfil-de-pruebas-backend-h2)
- [Interacción con la API (Swagger UI)](#interacción-con-la-api-swagger-ui)
- [Referencia de API](#referencia-de-api)
- [Autenticación](#autenticación)
- [Reglas de Negocio](#reglas-de-negocio)
- [Credenciales de Acceso](#credenciales-de-acceso)

---

## Descripción General

La aplicación permite:

- **Listar** el historial de transacciones paginado, ordenado por fecha descendente.
- **Filtrar** transacciones por nombre de Tenpista, comercio y rango de fechas.
- **Registrar** nuevas transacciones con validaciones de negocio.
- **Autenticarse** con JWT autogestionado (login → token → cookie), incorporado como mejora de seguridad.

> Nota: la autenticación no era un requerimiento explícito del challenge; se agregó para reforzar seguridad y demostrar buenas prácticas.

---

## Credenciales de Acceso

Usuario y contraseña del challenge (creados automáticamente por `DataInitializer` al iniciar backend):

| Campo | Valor |
|---|---|
| Username | `admin@tenpo.cl` |
| Password | `Tenpista2026!` |

---

## Arquitectura

### API Design First

El contrato de la API está definido **antes** de la implementación en:

```
backend/src/main/resources/openapi.yaml
```

El plugin `openapi-generator` de Gradle genera automáticamente las **interfaces de Spring MVC** (`@RequestMapping`) a partir del YAML durante la compilación. Los controladores implementan esas interfaces, garantizando que el código siempre esté alineado con el contrato.

```
openapi.yaml  →  openapi-generator (Gradle)  →  interfaces Java (build/generated)
                                                        ↑
                                              TransactionController
                                              AuthController
```

**Ventajas:**
- El YAML es la única fuente de verdad del contrato.
- Cambios en el contrato rompen en compile-time, no en runtime.
- La documentación Swagger UI (`/v1/api/api-docs/swagger-ui`) se genera desde el mismo YAML.

---

### Arquitectura Hexagonal (Backend)

El backend sigue el patrón **Ports & Adapters** (Hexagonal Architecture). El dominio no tiene ninguna dependencia de Spring ni de infraestructura.

```
┌────────────────────────────────────────────────────────────────────┐
│                         INFRAESTRUCTURA                            │
│                                                                    │
│  ┌────────────────────────┐     ┌────────────────────────────────┐ │
│  │  Adapter INPUT (REST)  │     │  Adapter OUTPUT (JPA/DB)       │ │
│  │                        │     │                                │ │
│  │  TransactionController │     │  TransactionPersistenceAdapter │ │
│  │  AuthController        │     │  UserPersistenceAdapter        │ │
│  │  DomainExceptionHandler│     │  TransactionEntity             │ │
│  │  JwtAuthFilter         │     │  UserEntity                    │ │
│  └──────────┬─────────────┘     └──────────────┬─────────────────┘ │
│             │                                  │                   │
└─────────────┼──────────────────────────────────┼───────────────────┘
              │ usa                              │ implementa
┌─────────────▼──────────────────────────────────▼───────────────────┐
│                           DOMINIO                                  │
│                                                                    │
│   Ports INPUT             Ports OUTPUT          Models             │
│   ──────────────          ────────────          ──────             │
│   TransactionUseCase  ←→  TransactionRepo       Transaction        │
│   AuthUseCase         ←→  UserRepo              User               │
│                                                 PageResult<T>      │
│                                                 Exceptions         │
│                                                                    │
│   Application Services (implementan los Ports INPUT):              │
│   TransactionService · AuthService                                 │
└────────────────────────────────────────────────────────────────────┘
```

**Regla de dependencias:** las flechas siempre apuntan **hacia el dominio**. El dominio no sabe nada de Spring, JPA ni HTTP.

| Capa | Paquete | Responsabilidad |
|---|---|---|
| **Domain** | `domain/model` | Entidades de negocio puras |
| **Domain** | `domain/port/input` | Interfaces de casos de uso |
| **Domain** | `domain/port/output` | Interfaces de repositorios |
| **Application** | `application/service` | Lógica de negocio, orquesta puertos |
| **Infra - Output** | `infrastructure/adapter/output/db` | JPA entities, mappers, adapters |
| **Infra - Input** | `infrastructure/adapter/input/rest` | Controllers, DTOs generados, REST mappers |
| **Infra - Config** | `infrastructure/config` | Spring Security, JWT, seed de datos |

---

### Estructura Frontend

El frontend está construido con **Refine v5**, un meta-framework sobre React que provee data fetching, auth, notificaciones y routing con mínimo boilerplate.

```
src/
├── providers/
│   ├── auth-provider/       # AuthProvider de Refine (login/logout/check)
│   └── data-provider/       # DataProvider personalizado (fetch con JWT)
│       └── shared/          # helpers: getAccessToken, handleJsonResponse
├── components/
│   ├── ui/                  # shadcn/ui: Button, Input, Dialog, Table, etc.
│   ├── layout/              # AppLayout: sidebar, navegación, tema, logout
│   └── refine-ui/           # Adaptadores Refine: DataTable, SignInForm,
│       ├── data-table/      #   paginación, notificaciones, theme provider
│       ├── form/
│       ├── layout/
│       ├── notification/
│       └── theme/
├── pages/
│   ├── login/               # Página de login
│   └── transactions/        # Lista + TransactionForm + TransactionFilters
├── types/                   # Tipos TypeScript (Transaction, TransactionPage)
├── lib/utils.ts             # cn(), formatCurrency(), formatDate()
├── App.tsx                  # Refine setup, rutas, providers
└── main.tsx                 # Entry point
```

---

## Principios SOLID en el Proyecto

El diseño del backend (arquitectura hexagonal + puertos) y del frontend (providers y componentes desacoplados) aplica SOLID de forma práctica:

### S — Single Responsibility Principle (SRP)

- Cada clase/componente tiene una responsabilidad concreta.
- Ejemplos backend:
  - `TransactionService` concentra reglas de negocio de transacciones.
  - `JwtAuthFilter` solo resuelve autenticación por token en la cadena de seguridad.
  - `DomainExceptionHandler` solo transforma excepciones en respuestas HTTP estandarizadas.
- Ejemplos frontend:
  - `transactionsDataProvider` encapsula acceso HTTP a transacciones.
  - `TransactionForm` maneja captura/validación del formulario.
  - `TransactionFilters` maneja estado y emisión de filtros.

### O — Open/Closed Principle (OCP)

- El sistema está abierto a extensión sin modificar la lógica central.
- Nuevos filtros en transacciones se agregan extendiendo criterios y contrato OpenAPI, sin romper servicios existentes.
- Nuevos adapters de salida (por ejemplo, otra persistencia) pueden implementarse sobre los mismos puertos del dominio.

### L — Liskov Substitution Principle (LSP)

- Las implementaciones de puertos (`TransactionRepo`, `UserRepo`) son sustituibles mientras respeten el contrato.
- En tests, dobles/mocks reemplazan implementaciones reales sin alterar el comportamiento esperado de casos de uso.

### I — Interface Segregation Principle (ISP)

- Se usan interfaces pequeñas y orientadas a casos de uso:
  - `TransactionUseCase` separado de `AuthUseCase`.
  - `TransactionRepo` separado de `UserRepo`.
- Esto evita dependencias innecesarias y reduce el impacto de cambios entre módulos.

### D — Dependency Inversion Principle (DIP)

- El dominio depende de abstracciones (ports), no de detalles de infraestructura.
- Los servicios de aplicación dependen de interfaces de repositorio, y los adapters de infraestructura implementan esas interfaces.
- Resultado: mayor testabilidad, bajo acoplamiento y posibilidad de reemplazar detalles técnicos (DB/framework) con cambios mínimos.

Resumen rápido (principio → evidencia → beneficio):

| Principio | Evidencia en el proyecto | Beneficio práctico |
|---|---|---|
| SRP | `TransactionService`, `JwtAuthFilter`, `DomainExceptionHandler`, `TransactionForm` | Menor complejidad por clase/componente y cambios más seguros |
| OCP | Extensión de filtros vía contrato OpenAPI + adapters sobre puertos | Nuevas capacidades sin reescribir lógica base |
| LSP | Implementaciones/mocks de `TransactionRepo` y `UserRepo` respetando contrato | Sustitución de implementaciones sin romper casos de uso |
| ISP | Interfaces separadas (`TransactionUseCase`, `AuthUseCase`, `TransactionRepo`, `UserRepo`) | Menor acoplamiento y dependencias más limpias |
| DIP | Dominio depende de puertos; infraestructura implementa adapters | Alta testabilidad y flexibilidad tecnológica |

---

## Automatización y Código Generado

En este proyecto, el código generado no se usa como “principio” arquitectónico, sino como una práctica para reducir boilerplate, asegurar consistencia y mover errores a compile-time.

| Herramienta / enfoque | Qué se genera o automatiza | Beneficio técnico |
|---|---|---|
| API Design First + OpenAPI Generator | Interfaces de controladores Spring MVC desde `openapi.yaml` | Contrato API como fuente de verdad; evita desalineación entre docs y código |
| Spring Data JPA | Implementación de acceso a datos a partir de repositorios e integración con entidades | Menos código repetitivo de persistencia y consultas más mantenibles |
| MapStruct | Implementaciones de mappers entre entidades/DTO/modelos en compile-time | Mapeos type-safe, rápidos y sin reflection en runtime |
| Lombok | Métodos/constructores comunes (`getter/setter`, `builder`, etc.) | Menor boilerplate y clases más enfocadas en lógica de negocio |

Resultado práctico: mayor productividad sin sacrificar calidad del diseño, manteniendo una base de código más limpia, consistente y fácil de evolucionar.

---

## Tecnologías

### Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 21 | Lenguaje, virtual threads |
| Spring Boot | 4.0.5 | Framework principal |
| Spring Security | 7.x | Seguridad, filtros JWT |
| Spring Data JPA | 3.x | Acceso a datos |
| PostgreSQL | 15 | Base de datos |
| Flyway | 10.x | Migraciones de esquema |
| JJWT | 0.12.x | Generación y validación de JWT |
| MapStruct | 1.5.5 | Mapeo entre capas |
| Lombok | 1.18.36 | Reducción de boilerplate |
| OpenAPI Generator | 7.4.0 | Generación de interfaces desde YAML |
| springdoc-openapi | 2.x | Swagger UI |

### Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3 | UI |
| Vite | 5.4 | Bundler y dev server |
| TypeScript | 5.6 | Tipado estático |
| Refine | 5.0 | Data fetching, auth, routing |
| React Router | 7.0 | Navegación SPA |
| TanStack Table | 8.x | Tabla con paginación server-side |
| shadcn/ui | — | Componentes UI (Radix UI + Tailwind) |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| react-hook-form | 7.x | Manejo de formularios |
| Zod | 3.x | Validación de schemas |
| Sonner | 2.x | Notificaciones toast |
| next-themes | 0.4 | Dark/light mode |
| js-cookie | 3.x | Almacenamiento del JWT |

### Infraestructura

| Tecnología | Uso |
|---|---|
| Docker + Docker Compose | Orquestación de servicios |
| nginx | Servidor del frontend (SPA routing) |
| eclipse-temurin:21 | Imagen base del backend |

---

## Estructura del Proyecto

```
tenpista-challenge/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/tenpista/challenge/backend/
│   │   │   │   ├── application/service/
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   └── TransactionService.java
│   │   │   │   ├── domain/
│   │   │   │   │   ├── exception/
│   │   │   │   │   ├── model/
│   │   │   │   │   └── port/
│   │   │   │   │       ├── input/
│   │   │   │   │       └── output/
│   │   │   │   └── infrastructure/
│   │   │   │       ├── adapter/
│   │   │   │       │   ├── input/rest/
│   │   │   │       │   └── output/db/
│   │   │   │       └── config/
│   │   │   └── resources/
│   │   │       ├── openapi.yaml          ← Contrato de la API
│   │   │       ├── application.yaml
│   │   │       └── db/migration/
│   │   │           ├── V1__Create_users_table.sql
│   │   │           └── V2__Create_transactions_table.sql
│   │   └── test/
│   ├── build.gradle
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── providers/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Variables de Entorno

> Para este challenge se usa **un solo archivo** versionado: `.env` en la raíz del proyecto.

### Backend

| Variable | Default | Descripción |
|---|---|---|
| `DB_HOST` | `localhost` | Host de PostgreSQL |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_NAME` | `tenpista_db` | Nombre de la base de datos |
| `DB_USER` | `user_cris` | Usuario de la base de datos |
| `DB_PASSWORD` | `password_cris` | Contraseña de la base de datos |
| `JWT_SECRET` | `tenpista-challenge-super-secret-key-change-in-production-2026` | Clave secreta HMAC-SHA256 (mín. 256 bits) |
| `JWT_EXPIRATION` | `86400000` | Expiración del token en ms (24 h) |
| `PORT` | `8080` | Puerto del servidor |
| `SHOW_SQL` | `false` | Log SQL de Hibernate |

> **Producción:** reemplazar `JWT_SECRET` por una clave segura generada con `openssl rand -base64 32`.

### Frontend

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/v1/api` | URL base del backend |

> La variable se hornea en el bundle de Vite en tiempo de compilación. Para Docker, se pasa como `build.args` en `docker-compose.yml`.

---

## Decisiones Técnicas

### 1. Arquitectura Hexagonal (Ports & Adapters)

**Decisión:** organizar el backend en capas domain → application → infrastructure con dependencias siempre apuntando hacia el dominio.

**Por qué:** el dominio de negocio (reglas de validación, modelos) queda completamente aislado de Spring, JPA e HTTP. Esto permite cambiar la base de datos o el framework web sin tocar una sola línea de lógica de negocio. También facilita el testing unitario del dominio sin necesidad de levantar el contexto de Spring.

---

### 2. API Design First con OpenAPI Generator

**Decisión:** definir el contrato en `openapi.yaml` antes de escribir código. El plugin `openapi-generator` de Gradle genera las interfaces Java en compile-time.

**Por qué:** garantiza que los controladores nunca se desvíen del contrato documentado. Si el YAML cambia, el código que no cumpla el nuevo contrato rompe en compilación, no en producción. Además, la documentación Swagger UI se genera desde la misma fuente de verdad, eliminando la posibilidad de que docs y código se desincronicen.

---

### 3. Autenticación agregada como mejora de seguridad (JWT)

**Decisión:** agregar login con JWT autogestionado (JJWT 0.12.x + Spring Security) como capa adicional de seguridad, aunque el challenge no lo exige explícitamente.

**Por qué:** el enunciado se centra en CRUD/listado de transacciones, validaciones y calidad técnica, sin requerir autenticación. Se incorporó login para proteger endpoints sensibles, simular un escenario más realista y demostrar manejo de seguridad en API REST sin depender de un proveedor externo.

**Alcance de la decisión:** se prefirió JWT autogestionado sobre OAuth2 para mantener bajo el overhead operativo del challenge. OAuth2 (Keycloak/Auth0) era válido, pero sobredimensionado para este contexto y tiempo de entrega.

**Detalle relevante:** se extrajo `PasswordEncoder` a una clase `PasswordConfig` separada para romper la dependencia circular `SecurityConfig → JwtAuthFilter → AuthService (UserDetailsService) → PasswordEncoder ← SecurityConfig`.

---

### 4. `PageResult<T>` propio en el dominio

**Decisión:** usar un POJO genérico `PageResult<T>` en las interfaces del dominio en lugar de `org.springframework.data.domain.Page<T>`.

**Por qué:** Spring's `Page<T>` es una clase de infraestructura. Usarla en los puertos del dominio introduciría una dependencia de Spring Data en la capa de negocio, rompiendo el principio de la arquitectura hexagonal. `PageResult<T>` es un POJO puro sin dependencias externas.

---

### 5. Flyway para migraciones + `ddl-auto: validate`

**Decisión:** usar Flyway para gestionar el esquema de la base de datos y configurar Hibernate en modo `validate`.

**Por qué:** `ddl-auto: create` o `update` son convenientes en desarrollo pero peligrosos en producción. Flyway da control total sobre cada cambio de esquema, con historial versionado y reproducible. El modo `validate` hace que la aplicación falle al arrancar si las entities no coinciden con la base de datos, evitando sorpresas en runtime.

**Seed de usuario con `ApplicationRunner`:** la contraseña se hashea con BCrypt, lo que requiere ejecutar código de Spring. No es posible pre-computar un hash BCrypt en una migración SQL sin hardcodear el valor, por lo que se usa un `DataInitializer` que crea el usuario admin al arrancar si no existe ninguno.

---

### 6. MapStruct para mapeo entre capas

**Decisión:** usar MapStruct en lugar de mapeo manual o ModelMapper.

**Por qué:** MapStruct genera el código de mapeo en compile-time. Es type-safe (los errores de mapeo aparecen en compilación), tiene cero overhead en runtime (no usa reflection) y es considerablemente más rápido que ModelMapper en benchmarks. Los mappers se detectan fácilmente en el código al ser clases generadas concretas.

---

### 7. Vite en lugar de Next.js para el frontend

**Decisión:** React SPA con Vite como bundler, servida con nginx.

**Por qué:** la aplicación no requiere SSR ni SSG — es un panel de administración con autenticación donde el contenido es completamente dinámico y privado. Next.js añadiría complejidad de servidor innecesaria. Vite ofrece HMR instantáneo en desarrollo y produce un bundle estático que nginx sirve de forma óptima. El Dockerfile resultante es más simple y el contenedor de producción es más liviano.

---

### 8. Refine v5 para el frontend

**Decisión:** usar Refine como meta-framework sobre React en lugar de implementar data fetching, paginación y auth guards desde cero.

**Por qué:** Refine elimina el boilerplate repetitivo de aplicaciones CRUD: paginación server-side, estado de loading/error, guards de autenticación, sincronización de filtros con la URL. Se integra nativamente con TanStack Table para paginación server-side y con React Router para routing. El `DataProvider` y el `AuthProvider` son contratos simples que se implementan una vez y se reutilizan en toda la app.

---

### 9. Virtual Threads (Java 21)

**Decisión:** activar virtual threads con `spring.threads.virtual.enabled: true`.

**Por qué:** las operaciones del backend son mayoritariamente I/O-bound (queries a base de datos, validaciones). Los virtual threads de Project Loom permiten manejar muchas más solicitudes concurrentes sin cambiar una sola línea de código de negocio, usando la misma API de threading bloqueante pero con el scheduler del JVM administrando el contexto de forma eficiente.

---

### 10. Spring Boot (4.0)

**Decisión:** usar la versión 4.0 de Spring Boot.

**Por qué:** Se optó por Spring Boot 4.0 para aprovechar el soporte nativo de primera clase para Virtual Threads y las optimizaciones de Spring Framework 7, garantizando un manejo de concurrencia eficiente con un consumo de recursos mínimo en entornos de contenedores.

---

### 11. Estandarización de errores con `DomainExceptionHandler`

**Decisión:** centralizar el manejo de excepciones de negocio y validación en una clase `DomainExceptionHandler` anotada con `@RestControllerAdvice`.

**Por qué:** permite devolver respuestas de error consistentes (status code, mensaje y estructura), desacoplando los controladores de la lógica de manejo de excepciones. Esto mejora la mantenibilidad, evita duplicación de bloques `try/catch` y hace más predecible el contrato de errores para el frontend y para consumidores de la API.

---

## Despliegue con Docker

### Requisitos

- Docker 24+
- Docker Compose v2

### Levantar todo el stack

```bash
docker compose up --build
```

Esto levanta tres servicios:

| Servicio | Puerto | Descripción |
|---|---|---|
| `tenpista-db` | 5432 | PostgreSQL 15 |
| `tenpista-api` | 8080 | Spring Boot 4 |
| `tenpista-ui` | 80 | React + nginx |

El backend espera a que la base de datos esté saludable (healthcheck) antes de arrancar. Flyway ejecuta las migraciones automáticamente al inicio. El usuario seed se crea en el primer arranque.

### Acceso

| Recurso | URL |
|---|---|
| Frontend | http://localhost |
| API REST | http://localhost:8080/v1/api |
| Swagger UI | http://localhost:8080/v1/api/api-docs/swagger-ui |

### Detener y limpiar

```bash
# Detener sin borrar datos
docker compose down

# Detener y borrar volumen de la base de datos
docker compose down -v
```

---

## Desarrollo Local

### Paso 1 — Levantar la base de datos

La forma más sencilla es levantar **solo el servicio de base de datos** con Docker Compose, sin compilar el resto:

```bash
docker compose up db -d
```

Esto inicia PostgreSQL en `localhost:5432` con las credenciales definidas en `docker-compose.yml`. El volumen `tenpista_db_data` persiste los datos entre reinicios.

Alternativamente, si tenés PostgreSQL instalado localmente, creá la base de datos manualmente:

```sql
CREATE DATABASE tenpista_db;
```

---

### Paso 2 — Levantar el backend

Requisitos: Java 21.

```bash
cd backend

# Compilar: genera las interfaces OpenAPI y compila el proyecto
./gradlew build

# Levantar (usa valores por default o los definidos en ../.env)
./gradlew bootRun
```

Al arrancar, Flyway ejecuta automáticamente las migraciones (`V1`, `V2`) y `DataInitializer` crea el usuario seed si no existe.

El servidor queda disponible en `http://localhost:8080/v1/api`.

---

### Paso 3 — Levantar el frontend

Requisitos: Node.js 20+.

```bash
cd frontend

npm install

npm run dev
```

El dev server arranca en `http://localhost:5173` con hot-reload habilitado.

> El archivo raíz `.env` ya contiene `VITE_API_URL=http://localhost:8080/v1/api` apuntando al backend local.

---

## Pruebas y Cobertura

### Reporte de Cobertura

Cobertura actual obtenida ejecutando los comandos del proyecto:

- Backend: `./gradlew cleanTest test jacocoTestReport jacocoTestCoverageVerification`
- Frontend: `npm run test:coverage`

Fecha de medición: **2026-04-09**.

| Módulo | Lines | Statements | Branches | Functions |
|---|---:|---:|---:|---:|
| Backend | **100.00%** | 100.00% | 100.00% | 100.00% |
| Frontend | **99.04%** | 99.04% | 92.41% | 92.85% |

Notas:

- En frontend, `npm run test:coverage` ejecuta Vitest con cobertura y luego valida automáticamente que **ningún archivo** quede bajo 80% de líneas.
- En backend, JaCoCo valida el umbral global de cobertura sobre el scope configurado en `build.gradle` (excluyendo código generado, DTOs, interfaces y POJOs de infraestructura no críticos).

### Perfil de Pruebas Backend (H2)

Para pruebas del backend se usa un perfil dedicado llamado **test** con base de datos **H2 en memoria**, definido en:

```
backend/src/test/resources/application-test.yaml
```

Objetivo del perfil:

- Evitar dependencia de una base PostgreSQL real durante tests unitarios/integración ligera.
- Hacer las pruebas más rápidas, determinísticas y aisladas.
- Evitar fallos por credenciales, red o estado externo.

Configuración clave del perfil test:

- `spring.datasource.url`: H2 en memoria (`jdbc:h2:mem:...`)
- `spring.jpa.hibernate.ddl-auto`: `create-drop`
- `spring.flyway.enabled`: `false`

Además, el test de contexto usa explícitamente este perfil (`@ActiveProfiles("test")`) para garantizar que siempre cargue H2 y no PostgreSQL local.

---

## Interacción con la API (Swagger UI)

La API está documentada con Swagger UI, generada automáticamente desde `openapi.yaml`.

**URL (con Docker o backend local):**
```
http://localhost:8080/v1/api/api-docs/swagger-ui
```

### Cómo autenticarse en Swagger UI

Los endpoints de `/transactions` requieren JWT. Para usarlos desde Swagger:

**1. Obtener el token — ejecutar `POST /auth/login`**

En Swagger UI, expandir el endpoint `POST /auth/login`, hacer clic en **Try it out** e ingresar:

```json
{
  "username": "admin@tenpo.cl",
  "password": "Tenpista2026!"
}
```

Ejecutar y copiar el valor de `access_token` de la respuesta.

**2. Autorizar las requests**

Hacer clic en el botón **Authorize** (candado) en la parte superior de Swagger UI. En el campo `bearerAuth`, pegar el token copiado (sin el prefijo "Bearer") y confirmar.

**3. Usar los endpoints protegidos**

Con el token configurado, ya es posible ejecutar `GET /transactions` y `POST /transactions` directamente desde Swagger UI. El header `Authorization: Bearer <token>` se agrega automáticamente a cada request.

---

## Referencia de API

### Autenticación

```
POST /auth/login
```

**Body:**
```json
{
  "username": "admin@tenpo.cl",
  "password": "Tenpista2026!"
}
```

**Response `200`:**
```json
{
  "access_token": "eyJhbGci...",
  "token_type": "Bearer"
}
```

---

### Listar Transacciones

```
GET /transactions?page=0&size=10&tenpistaName=Cristian&commerceName=Starbucks&fromDate=2026-04-01T00:00:00Z&toDate=2026-04-09T23:59:59Z
```

Requiere header: `Authorization: Bearer <token>`

**Query Params:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | integer | `0` | Número de página (base 0) |
| `size` | integer | `10` | Elementos por página (máx. 100) |
| `tenpistaName` | string | — | Filtro parcial por nombre (case-insensitive) |
| `commerceName` | string | — | Filtro parcial por comercio/giro (case-insensitive) |
| `fromDate` | date-time | — | Fecha/hora inicial inclusiva para `transaction_date` |
| `toDate` | date-time | — | Fecha/hora final inclusiva para `transaction_date` |

> Si `fromDate` y `toDate` vienen informadas, el backend valida que `fromDate <= toDate`.

**Response `200`:**
```json
{
  "content": [
    {
      "id": 1,
      "amount": 5000,
      "commerce_name": "Starbucks",
      "tenpista_name": "Cristian",
      "transaction_date": "2026-04-09T10:30:00Z",
      "created_at": "2026-04-09T12:00:00Z"
    }
  ],
  "total_elements": 1,
  "total_pages": 1,
  "page": 0,
  "size": 10
}
```

---

### Crear Transacción

```
POST /transactions
```

Requiere header: `Authorization: Bearer <token>`

**Body:**
```json
{
  "amount": 5000,
  "commerce_name": "Starbucks",
  "tenpista_name": "Cristian",
  "transaction_date": "2026-04-09T10:30:00Z"
}
```

**Response `201`:** TransactionResponse con el recurso creado.

**Errores comunes:**

| Código | Causa |
|---|---|
| `400` | Monto `<= 0` o fecha futura |
| `401` | Token ausente, expirado o inválido |

---

## Autenticación

El sistema usa **JWT autogestionado** con JJWT (HMAC-SHA256, expiración configurable).

**Flujo:**

```
Usuario → POST /auth/login → JWT
                              ↓
                         Cookie (access_token)
                              ↓
                    Authorization: Bearer <token>
                              ↓
                    JwtAuthenticationFilter valida
                              ↓
                         Acceso al recurso
```

**Usuario seed** (creado automáticamente al arrancar si no existen usuarios):

| Campo | Valor |
|---|---|
| Username | `admin@tenpo.cl` |
| Password | `Tenpista2026!` |

---

## Reglas de Negocio

| Regla | Detalle |
|---|---|
| `amount > 0` | El monto debe ser un entero positivo en pesos CLP |
| `transaction_date <= now()` | La fecha de la transacción no puede ser futura |
| `fromDate <= toDate` | En el listado de transacciones, el rango de fechas debe ser válido |
| Autenticación requerida | Todos los endpoints de `/transactions` requieren JWT válido |

Las validaciones se aplican en **dos capas**:
- **Frontend:** Zod schema en el formulario (feedback inmediato al usuario).
- **Backend:** `TransactionService` valida creación y rango de filtros, y lanza `InvalidBusinessRuleException` → HTTP 400.

**Por que** Esta estrategia de validación doble garantiza una UX fluida (feedback inmediato en el front) y integridad de datos absoluta (defensa en profundidad en el backend) ante cualquier bypass accidental o malintencionado de la UI.
