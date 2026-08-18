## A. STACK TECNOLÓGICO

A continuación se detalla el stack tecnológico completo con las versiones exactas estipuladas para asegurar total compatibilidad.

### Dependencias del Frontend (Next.js)

| Paquete | Versión Exacta | Propósito |
| :--- | :--- | :--- |
| `next` | 16.3.1 | Framework React principal para la aplicación web. |
| `react` | 19.2.8 | Librería de interfaz de usuario subyacente. |
| `react-dom` | 19.2.8 | Renderizado en el DOM de componentes React. |
| `next-auth` | 4.24.11 | Sistema de autenticación seguro y estandarizado. |
| `tailwindcss` | 4.3.3 | Framework de CSS utilitario para estilizado ágil. |
| `zod` | 4.0.0 | Validación de esquemas y tipos de datos (form validation). |
| `zustand` | 5.0.14 | Manejo de estado global en el cliente, ligero y escalable. |
| `axios` | 1.19.0 | Cliente HTTP para consumo de APIs externas e internas. |
| `socket.io-client` | 4.8.3 | Cliente WebSocket para señalización en tiempo real (chat/eventos). |
| `mediasoup-client` | 3.22.0 | Cliente WebRTC para la transmisión de video/audio de baja latencia. |

### Dependencias del Backend (Express API)

| Paquete | Versión Exacta | Propósito |
| :--- | :--- | :--- |
| `express` | 5.2.1 | Framework base del servidor backend (Node.js). |
| `prisma` | 7.9.1 | ORM CLI para el diseño y migración de la base de datos. |
| `@prisma/client` | 7.9.1 | Cliente ORM auto-generado para consultas tipadas a la BD. |
| `stripe` | 22.5.0 | SDK para procesamiento de pagos y suscripciones. |
| `jsonwebtoken` | 9.0.3 | Generación y verificación de tokens JWT para sesiones API. |
| `bcryptjs` | 3.0.3 | Cifrado criptográfico seguro de contraseñas. |
| `socket.io` | 4.8.3 | Servidor WebSocket para señalización bidireccional. |
| `ioredis` | 6.0.0 | Cliente de Redis para caché y Pub/Sub. |
| `multer` | 2.2.0 | Middleware para el procesamiento de subida de archivos (multipart/form-data). |
| `node-cron` | 4.6.0 | Programador de tareas en segundo plano (background jobs). |

### Dependencias del Media Server (SFU)

| Paquete | Versión Exacta | Propósito |
| :--- | :--- | :--- |
| `mediasoup` | 3.24.2 | Motor SFU (Selective Forwarding Unit) en C++ para WebRTC ultra-rápido. |
| `express` | 5.2.1 | Exposición de endpoints de control y workers. |
| `socket.io` | 4.8.3 | Señalización exclusiva entre los clientes y el router de mediasoup. |

### Herramientas de Desarrollo

| Paquete | Versión Exacta | Propósito |
| :--- | :--- | :--- |
| `typescript` | 7.0.2 | Lenguaje y compilador central del monorepo (Type Safety). |

## B. COMANDOS DE SETUP

Ejecutar los siguientes comandos desde la raíz deseada para preparar el entorno del monorepo y la infraestructura base.

### 1. Crear el monorepo
```bash
mkdir incubator-quick-pitch
cd incubator-quick-pitch
npm init -y
```

### 2. Inicializar el frontend con Next.js 16
```bash
npx create-next-app@16.3.1 frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
cd frontend
npm install react@19.2.8 react-dom@19.2.8 next@16.3.1 next-auth@4.24.11 tailwindcss@4.3.3 zod@4.0.0 zustand@5.0.14 axios@1.19.0 socket.io-client@4.8.3 mediasoup-client@3.22.0
cd ..
```

### 3. Inicializar el backend con Express 5
```bash
mkdir backend
cd backend
npm init -y
npm install express@5.2.1 @prisma/client@7.9.1 stripe@22.5.0 jsonwebtoken@9.0.3 bcryptjs@3.0.3 socket.io@4.8.3 ioredis@6.0.0 multer@2.2.0 node-cron@4.6.0
npm install -D prisma@7.9.1 typescript@7.0.2 ts-node @types/express @types/node @types/jsonwebtoken @types/bcryptjs @types/multer
npx tsc --init
npx prisma init
cd ..
```

### 4. Inicializar el media server
```bash
mkdir media-server
cd media-server
npm init -y
npm install mediasoup@3.24.2 express@5.2.1 socket.io@4.8.3
npm install -D typescript@7.0.2 ts-node @types/express @types/node
npx tsc --init
cd ..
```

### 5. Configurar Docker Compose

Crear el archivo `docker-compose.yml` en la raíz del proyecto (`incubator-quick-pitch/docker-compose.yml`):

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: incubator_postgres
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: adminpassword
      POSTGRES_DB: incubator_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: incubator_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  minio:
    image: minio/minio:latest
    container_name: incubator_minio
    restart: always
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: adminpassword123
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

volumes:
  pgdata:
  redisdata:
  miniodata:
```
Comando para levantar la infraestructura:
```bash
docker-compose up -d
```

### 6. Configurar TypeScript
Crear un archivo base `tsconfig.base.json` en la raíz (luego los proyectos pueden extender de él si usan workspaces):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 7. Configurar ESLint/Prettier
```bash
npm install -D eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```
Crear `.prettierrc`:
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## C. PRISMA SCHEMA COMPLETO

El siguiente esquema debe residir en `backend/prisma/schema.prisma`. Representa la arquitectura relacional completa para la plataforma.

```prisma
// ============================================================================
// CONFIGURACIÓN PRINCIPAL
// ============================================================================
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// ENUMS
// ============================================================================
enum UserRole {
  ENTREPRENEUR
  INVESTOR
  ADMIN
}

enum PitchSessionStatus {
  SCHEDULED
  LIVE
  COMPLETED
  CANCELLED
}

enum SubscriptionPlan {
  FREE
  PRO
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
}

enum NotificationType {
  SYSTEM
  MATCH
  INVESTMENT
  PITCH_INVITE
}

enum PaymentMethodType {
  FIAT
  CRYPTO
}

enum InvestmentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

// ============================================================================
// MODELOS DE USUARIO Y SUSCRIPCIÓN
// ============================================================================

/// Representa a cualquier usuario del sistema.
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Contraseña hasheada (bcrypt)
  role      UserRole @default(ENTREPRENEUR)
  firstName String
  lastName  String
  avatarUrl String?
  isActive  Boolean  @default(true)
  
  // Relaciones
  startup                Startup?                // Un emprendedor tiene 1 startup principal (en este modelo básico)
  investments            Investment[]            // Inversiones realizadas (si es inversor)
  rooms                  RoomParticipant[]       // Participación en salas de pitch
  ratingsGiven           Rating[]                // Calificaciones otorgadas
  auditLogs              AuditLog[]              // Acciones registradas
  matchmakingPreferences MatchmakingPreference?  // Preferencias para el algoritmo
  notifications          Notification[]          // Notificaciones recibidas
  subscription           Subscription?           // Suscripción activa
  calendarEvents         CalendarEvent[]         // Eventos del usuario
  tickets                Ticket[]                // Boletos comprados para eventos

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}

/// Define la suscripción de pago (Stripe) de un usuario.
model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  stripeCustomerId     String?            @unique
  stripeSubscriptionId String?            @unique
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodEnd     DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============================================================================
// MODELOS DE STARTUP Y PITCHES
// ============================================================================

/// Datos específicos de la Startup vinculada a un emprendedor.
model Startup {
  id                  String  @id @default(uuid())
  userId              String  @unique // Creador/Emprendedor
  name                String
  industry            String  // e.g. "Fintech", "Healthtech"
  stage               String  // e.g. "Pre-Seed", "Seed", "Series A"
  fundingGoal         Decimal @db.Decimal(15, 2)
  amountRaised        Decimal @default(0) @db.Decimal(15, 2)
  description         String  @db.Text
  encryptedPitchDeck  String? // URL o CID del pitch deck cifrado (ej. MinIO / IPFS)
  
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  pitchSessions  PitchSession[] // Sesiones donde esta startup se presenta
  investments    Investment[]   // Inversiones recibidas
  ratings        Rating[]       // Calificaciones promedio/históricas
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([industry])
  @@index([stage])
}

/// Una sesión de Pitch (evento temporal y en vivo).
model PitchSession {
  id             String             @id @default(uuid())
  startupId      String
  title          String
  status         PitchSessionStatus @default(SCHEDULED)
  scheduledFor   DateTime
  durationMinutes Int               @default(15) // Duración de los Quick Pitches
  recordingUrl   String?            // URL del video almacenado post-sesión
  
  startup Startup @relation(fields: [startupId], references: [id], onDelete: Cascade)
  room    Room?   // Sala de WebRTC asociada

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([scheduledFor])
}

// ============================================================================
// MODELOS DE INFRAESTRUCTURA DE VIDEO (MEDIASOUP)
// ============================================================================

/// Sala de WebRTC asignada a un PitchSession.
model Room {
  id             String  @id @default(uuid())
  pitchSessionId String  @unique
  accessCode     String  @unique // Código corto para acceso seguro (ej. invitados)
  isLocked       Boolean @default(false)
  
  pitchSession PitchSession      @relation(fields: [pitchSessionId], references: [id], onDelete: Cascade)
  participants RoomParticipant[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

/// Registro de usuarios conectados a una sala.
model RoomParticipant {
  id       String   @id @default(uuid())
  roomId   String
  userId   String
  joinedAt DateTime @default(now())
  leftAt   DateTime?
  
  room Room @relation(fields: [roomId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([roomId])
  @@index([userId])
}

// ============================================================================
// MODELOS FINANCIEROS Y EVENTOS
// ============================================================================

/// Registro de inversión de un Investor a una Startup (Fiat o Cripto).
model Investment {
  id                String            @id @default(uuid())
  investorId        String
  startupId         String
  amount            Decimal           @db.Decimal(15, 2)
  paymentMethodType PaymentMethodType
  transactionHash   String?           @unique // Para cripto: TxID. Para Fiat: Stripe Charge ID
  status            InvestmentStatus  @default(PENDING)
  currency          String            @default("USD") // "USD", "ETH", "USDC"
  
  investor User    @relation(fields: [investorId], references: [id], onDelete: Cascade)
  startup  Startup @relation(fields: [startupId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([investorId])
  @@index([startupId])
  @@index([status])
}

/// Boletos para eventos macro organizados por la incubadora (Demo Days).
model Ticket {
  id            String  @id @default(uuid())
  userId        String
  eventId       String  // Relacionado con un CalendarEvent de tipo Demo Day
  qrCode        String  @unique // Cadena cifrada para validación de entrada
  pricePaid     Decimal @db.Decimal(10, 2)
  isUsed        Boolean @default(false)

  user          User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  calendarEvent CalendarEvent  @relation(fields: [eventId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============================================================================
// MODELOS DE OPERACIÓN, MATCHMAKING Y UTILIDADES
// ============================================================================

/// Preferencias de inversión/matchmaking de un Inversor.
model MatchmakingPreference {
  id                 String   @id @default(uuid())
  userId             String   @unique
  preferredIndustries String[] // Array de industrias preferidas (ej. ["Fintech", "Web3"])
  preferredStages    String[] // Array de etapas (ej. ["Seed"])
  minTicketSize      Decimal? @db.Decimal(15, 2)
  maxTicketSize      Decimal? @db.Decimal(15, 2)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

/// Calificación de una sesión/startup emitida por un inversor.
model Rating {
  id          String  @id @default(uuid())
  startupId   String
  investorId  String
  score       Int     // 1 a 5
  feedback    String? @db.Text
  isPublic    Boolean @default(false)

  startup  Startup @relation(fields: [startupId], references: [id], onDelete: Cascade)
  investor User    @relation(fields: [investorId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([startupId, investorId]) // Un inversor califica una startup una sola vez
}

/// Sincronización de eventos para Google Calendar / iCal.
model CalendarEvent {
  id          String   @id @default(uuid())
  userId      String
  title       String
  description String?  @db.Text
  startTime   DateTime
  endTime     DateTime
  externalId  String?  // ID del evento en Google Calendar
  
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tickets Ticket[] // Relación para boletos asociados a este evento

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([startTime])
}

/// Sistema de notificaciones in-app.
model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      NotificationType
  title     String
  body      String
  isRead    Boolean          @default(false)
  linkUrl   String?          // Redirección al hacer clic
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([isRead])
}

/// Registro inmutable para compliance y auditoría financiera/seguridad.
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?  // Puede ser nulo si es una acción del sistema
  action     String   // e.g., "USER_LOGIN", "INVESTMENT_INITIATED", "DECK_DOWNLOADED"
  entityType String   // Tabla/Entidad afectada
  entityId   String
  metadata   Json?    // Snapshot del cambio o IP address
  
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  createdAt DateTime @default(now())

  @@index([action])
  @@index([entityType, entityId])
}
```
