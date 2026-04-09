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
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Despliegue con Docker](#despliegue-con-docker)
- [Desarrollo Local](#desarrollo-local)
- [API Reference](#api-reference)
- [Autenticación](#autenticación)
- [Reglas de Negocio](#reglas-de-negocio)

---

## Descripción General

La aplicación permite a usuarios autenticados:

- **Listar** el historial de transacciones paginado, ordenado por fecha descendente.
- **Filtrar** transacciones por nombre de Tenpista (búsqueda parcial, case-insensitive).
- **Registrar** nuevas transacciones con validaciones de negocio.
- **Autenticarse** con JWT autogestionado (login → token → cookie).

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
┌─────────────────────────────────────────────────────────────────┐
│                         INFRAESTRUCTURA                         │
│                                                                 │
│  ┌──────────────────────┐     ┌───────────────────────────────┐ │
│  │  Adapter INPUT (REST) │     │  Adapter OUTPUT (JPA/DB)      │ │
│  │                      │     │                               │ │
│  │  TransactionController│     │  TransactionPersistenceAdapter│ │
│  │  AuthController       │     │  UserPersistenceAdapter       │ │
│  │  DomainExceptionHandler│    │  TransactionEntity            │ │
│  │  JwtAuthFilter        │     │  UserEntity                   │ │
│  └──────────┬───────────┘     └──────────────┬────────────────┘ │
│             │                                │                  │
└─────────────┼────────────────────────────────┼──────────────────┘
              │ usa                            │ implementa
┌─────────────▼────────────────────────────────▼──────────────────┐
│                           DOMINIO                               │
│                                                                 │
│   Ports INPUT             Ports OUTPUT          Models          │
│   ──────────────          ────────────          ──────          │
│   TransactionUseCase  ←→  TransactionRepo       Transaction     │
│   AuthUseCase         ←→  UserRepo              User            │
│                                                 PageResult<T>   │
│                                                 Exceptions      │
│                                                                 │
│   Application Services (implementan los Ports INPUT):           │
│   TransactionService · AuthService                              │
└─────────────────────────────────────────────────────────────────┘
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

### Backend

| Variable | Default | Descripción |
|---|---|---|
| `SPRING_DATASOURCE_URL` | — | URL JDBC de PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | — | Usuario de la base de datos |
| `SPRING_DATASOURCE_PASSWORD` | — | Contraseña de la base de datos |
| `JWT_SECRET` | `tenpista-challenge-default...` | Clave secreta HMAC-SHA256 (mín. 256 bits) |
| `JWT_EXPIRATION` | `86400000` | Expiración del token en ms (24 h) |
| `PORT` | `8080` | Puerto del servidor |

> **Producción:** reemplazar `JWT_SECRET` por una clave segura generada con `openssl rand -base64 32`.

### Frontend

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/v1/api` | URL base del backend |

> La variable se hornea en el bundle de Vite en tiempo de compilación. Para Docker, se pasa como `build.args` en `docker-compose.yml`.

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

### Backend

Requisitos: Java 21, PostgreSQL 15 corriendo localmente.

```bash
cd backend

# Compilar (genera código OpenAPI y compila)
./gradlew build

# Levantar con variables de entorno
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/tenpista_db \
SPRING_DATASOURCE_USERNAME=postgres \
SPRING_DATASOURCE_PASSWORD=postgres \
./gradlew bootRun
```

El servidor arranca en `http://localhost:8080/v1/api`.

### Frontend

Requisitos: Node.js 20+.

```bash
cd frontend

npm install

# Crear archivo de entorno (ya existe por defecto)
# VITE_API_URL=http://localhost:8080/v1/api

npm run dev
```

El dev server arranca en `http://localhost:5173`.

---

## API Reference

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
GET /transactions?page=0&size=10&tenpistaName=Cristian
```

Requiere header: `Authorization: Bearer <token>`

**Query Params:**

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `page` | integer | `0` | Número de página (base 0) |
| `size` | integer | `10` | Elementos por página (máx. 100) |
| `tenpistaName` | string | — | Filtro parcial por nombre (case-insensitive) |

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
| Autenticación requerida | Todos los endpoints de `/transactions` requieren JWT válido |

Las validaciones se aplican en **dos capas**:
- **Frontend:** Zod schema en el formulario (feedback inmediato al usuario).
- **Backend:** `TransactionService` lanza `InvalidBusinessRuleException` → HTTP 400.
