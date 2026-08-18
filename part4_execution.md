# PARTE 4: PLAN DE EJECUCIÓN DÍA A DÍA, GUÍAS DE INTEGRACIÓN Y PROMPTS PARA IA

## A. PLAN DÍA A DÍA (6 DÍAS)

Este plan está diseñado para un desarrollo hiper-acelerado (jornadas de 10-12 horas). Cada día se enfoca en entregar valor funcional end-to-end.

### DÍA 1 (Lunes): Cimientos y Autenticación
**Horario Sugerido:** 08:00 - 20:00

**Tareas Específicas:**
- [ ] Inicializar monorepo Turborepo.
- [ ] Configurar `docker-compose.yml` (PostgreSQL, Redis, MinIO).
- [ ] Definir el esquema completo de Prisma y correr la primera migración.
- [ ] Implementar el módulo de Autenticación (JWT, Guards, Decoradores de Roles).
- [ ] Configurar Next.js con Tailwind CSS y Shadcn UI.
- [ ] Crear layouts base (Navbar, Sidebar) y rutas protegidas en Next.js.
- [ ] Desarrollar Landing Page básica.
- [ ] Desarrollar páginas de Login y Registro.

**Archivos Clave a Crear:**
- `docker-compose.yml`
- `packages/database/prisma/schema.prisma`
- `apps/api/src/auth/auth.module.ts` (y servicio/controlador)
- `apps/web/app/(auth)/login/page.tsx`
- `apps/web/app/(auth)/register/page.tsx`
- `apps/web/components/layout/Navbar.tsx`

**Comandos Clave:**
```bash
npx create-turbo@latest my-incubator
docker-compose up -d
npx prisma migrate dev --name init
npm run dev
```

**Resultado Esperado:** Base de datos y caché corriendo localmente. Un usuario puede registrarse, hacer login, recibir su JWT y ver el layout de la app dependiendo de su rol.

---

### DÍA 2 (Martes): Core de Negocio (Startups & Marketplace)
**Horario Sugerido:** 08:00 - 20:00

**Tareas Específicas:**
- [ ] Implementar CRUD de Startups en NestJS (Controlador, Servicio, DTOs).
- [ ] Configurar subida de archivos (Pitch Deck) con cifrado AES-256 antes de enviar a MinIO.
- [ ] Crear el endpoint de búsqueda/filtrado para el Marketplace.
- [ ] Desarrollar Dashboard del Emprendedor (gestión de su startup).
- [ ] Desarrollar Dashboard del Inversionista (vista de marketplace).
- [ ] Desarrollar Perfil Público de Startup.
- [ ] Implementar algoritmo básico de Matchmaking basado en sectores e intereses.

**Archivos Clave a Crear:**
- `apps/api/src/startups/startups.service.ts`
- `apps/api/src/upload/crypto.service.ts`
- `apps/web/app/(dashboard)/entrepreneur/page.tsx`
- `apps/web/app/(dashboard)/investor/marketplace/page.tsx`
- `apps/web/app/startups/[id]/page.tsx`

**Resultado Esperado:** Un emprendedor puede crear su startup y subir su pitch deck cifrado. Un inversionista puede buscar startups en el marketplace y ver sus perfiles.

---

### DÍA 3 (Miércoles): Video y Tiempo Real
**Horario Sugerido:** 08:00 - 20:00

**Tareas Específicas:**
- [ ] Configurar `Socket.IO` en NestJS (Gateway).
- [ ] Crear lógica de salas de pitch (crear sala, unir participante, sala de espera).
- [ ] Implementar cronómetro centralizado y sincronizado vía WebSocket.
- [ ] Implementar señalización WebRTC básica para video peer-to-peer.
- [ ] Desarrollar la UI de la Sala de Pitch (grid de video, controles, cronómetro).
- [ ] Implementar chat en tiempo real dentro de la sala.

**Archivos Clave a Crear:**
- `apps/api/src/pitch-rooms/pitch-rooms.gateway.ts`
- `apps/api/src/pitch-rooms/pitch-rooms.service.ts`
- `apps/web/hooks/useWebRTC.ts`
- `apps/web/app/room/[roomId]/page.tsx`
- `apps/web/components/room/VideoGrid.tsx`
- `apps/web/components/room/Chat.tsx`

**Resultado Esperado:** Usuarios pueden entrar a una URL de sala, verse a través de la webcam, chatear y ver un cronómetro sincronizado bajando.

---

### DÍA 4 (Jueves): Pagos y Transacciones
**Horario Sugerido:** 08:00 - 20:00

**Tareas Específicas:**
- [ ] Integrar Stripe Checkout para compra de entradas y suscripciones.
- [ ] Crear endpoints para procesar Webhooks de Stripe (actualizar roles/accesos).
- [ ] Integrar Binance Pay API para inversiones en cripto.
- [ ] Crear endpoints para procesar Webhooks de Binance Pay.
- [ ] Desarrollar página de Planes y Precios.
- [ ] Desarrollar UI para invertir en una Startup (modal de pago fiat/cripto).
- [ ] Crear tabla de Historial de Transacciones en los dashboards.

**Archivos Clave a Crear:**
- `apps/api/src/payments/stripe.service.ts`
- `apps/api/src/payments/binance.service.ts`
- `apps/api/src/payments/webhooks.controller.ts`
- `apps/web/app/pricing/page.tsx`
- `apps/web/components/payments/InvestModal.tsx`

**Comandos Clave:**
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**Resultado Esperado:** Flujos de pago funcionales en modo de prueba. Webhooks actualizando la base de datos correctamente.

---

### DÍA 5 (Viernes): Funcionalidades Avanzadas y Calendarios
**Horario Sugerido:** 08:00 - 20:00

**Tareas Específicas:**
- [ ] Implementar flujo OAuth2 para Google Calendar.
- [ ] Implementar flujo OAuth2 para Microsoft Outlook.
- [ ] Crear endpoints para agendar reuniones automáticas tras un Match.
- [ ] Desarrollar Panel de Auditoría para Administradores (logs del sistema).
- [ ] Desarrollar Panel Financiero y Gestión de Usuarios para Administradores.
- [ ] Implementar sistema de Ratings (Inversionistas calificando Pitches).
- [ ] Configurar sistema de notificaciones in-app o por email.

**Archivos Clave a Crear:**
- `apps/api/src/calendar/google-calendar.service.ts`
- `apps/api/src/calendar/outlook-calendar.service.ts`
- `apps/api/src/admin/admin.controller.ts`
- `apps/web/app/(dashboard)/admin/audit/page.tsx`
- `apps/web/app/(dashboard)/admin/users/page.tsx`

**Resultado Esperado:** Agendamiento automático en calendarios externos. El administrador tiene control total sobre usuarios, transacciones y logs de auditoría.

---

### DÍA 6 (Sábado): Pulido, Testing y Entrega
**Horario Sugerido:** 08:00 - 20:00

**Tareas Específicas:**
- [ ] Realizar pruebas E2E de los flujos principales (Registro -> Pitch -> Inversión).
- [ ] Corregir bugs críticos detectados.
- [ ] Revisión exhaustiva de Responsive Design (Móvil, Tablet, Desktop).
- [ ] Redactar el `README.md` con instrucciones de levantamiento.
- [ ] Crear `Dockerfile` y `docker-compose.prod.yml` para producción.
- [ ] Desplegar Frontend en Vercel.
- [ ] Desplegar Backend y BD en Render/Railway o VPS.
- [ ] Grabar video de demostración.

**Archivos Clave a Crear:**
- `README.md`
- `apps/api/Dockerfile`
- `apps/web/Dockerfile`

**Resultado Esperado:** Proyecto en línea, documentado y listo para ser presentado.

---

## B. GUÍA DE INTEGRACIÓN DE APIs EXTERNAS

### 1. Stripe
1. **Crear cuenta:** Ve a [dashboard.stripe.com/register](https://dashboard.stripe.com/register).
2. **Obtener API keys:** En el Dashboard, asegúrate de estar en "Test Mode" (Modo de prueba). Ve a *Developers > API keys*. Copia la `Publishable key` y la `Secret key`.
3. **Crear productos:** En *Products*, crea los planes de suscripción (ej. "Acceso Premium Inversionista") y obtén los `price_id`.
4. **Configurar Webhook Local:** Instala Stripe CLI.
5. **Comandos de Stripe CLI:**
   ```bash
   stripe login
   stripe listen --forward-to localhost:3001/api/webhooks/stripe
   # Copia el webhook secret (whsec_...) que te da la terminal
   ```

### 2. Binance Pay
1. **Cuenta Merchant:** Crea una cuenta en Binance y aplica para ser Merchant en [merchant.binance.com](https://merchant.binance.com).
2. **Obtener Keys:** En el portal de Merchant, ve a *Developer > API Management* para obtener el `API Key` y `Secret Key`.
3. **Webhooks:** En la misma sección, configura tu URL de Webhook (debe ser HTTPS, usar ngrok para local).
4. **Certificado Público:** Para verificar firmas de webhooks, descarga el certificado público de Binance según la documentación oficial de Binance Pay.
5. **Sandbox:** Utiliza el entorno de prueba de Binance Pay para probar pagos sin fondos reales.

### 3. Google Calendar
1. **Google Cloud Console:** Ve a [console.cloud.google.com](https://console.cloud.google.com). Crea un nuevo proyecto.
2. **Habilitar API:** Ve a *APIs & Services > Library*, busca "Google Calendar API" y habilítala.
3. **Consent Screen:** Ve a *OAuth consent screen*. Configura como tipo "External". Llena los datos básicos. Añade los scopes `.../auth/calendar` y `.../auth/calendar.events`. Añade tu email como Test User.
4. **Credenciales:** Ve a *Credentials > Create Credentials > OAuth client ID*. Tipo de aplicación: "Web application". Configura los `Authorized redirect URIs` (ej. `http://localhost:3001/api/calendar/google/callback`).
5. **Keys:** Copia el `Client ID` y `Client Secret`.

### 4. Microsoft Graph (Outlook)
1. **Azure AD:** Ve a [portal.azure.com](https://portal.azure.com). Busca "Microsoft Entra ID" (antes Azure Active Directory).
2. **Registrar App:** Ve a *App registrations > New registration*. Nombre de tu app, Supported account types: "Accounts in any organizational directory and personal Microsoft accounts". Redirect URI: `Web` -> `http://localhost:3001/api/calendar/outlook/callback`.
3. **Permisos:** Ve a *API permissions > Add a permission > Microsoft Graph > Delegated permissions*. Selecciona `Calendars.ReadWrite`.
4. **Client Secret:** Ve a *Certificates & secrets > New client secret*. Cópialo inmediatamente. Copia también el `Application (client) ID` de la vista general.

---

## C. PROMPTS PARA CONSTRUIR CON IA

Copia y pega estos prompts exactos en tu herramienta de IA (Claude, GPT-4, etc.) para generar el código rápidamente.

### 1. Setup del Proyecto y Docker
> "Actúa como un DevOps y Senior TypeScript Engineer. Necesito crear un monorepo con Turborepo que contenga una aplicación Next.js 14 (App Router) en `apps/web` y una API NestJS en `apps/api`. Además, necesito un archivo `docker-compose.yml` en la raíz que levante PostgreSQL 15, Redis 7 y MinIO (compatible con S3). Escribe los comandos de terminal para inicializar el monorepo y proporciona el código exacto del `docker-compose.yml` con variables de entorno básicas para desarrollo local."

### 2. Prisma Schema y Migraciones
> "Escribe un esquema de Prisma (`schema.prisma`) para una plataforma de incubadora de startups. Debe incluir los modelos: User (id, email, password, role [ADMIN, ENTREPRENEUR, INVESTOR, SPECTATOR]), Startup (relacionada al emprendedor, nombre, descripción, sector, stage, fundingGoal), PitchDeck (relacionado a startup, fileUrl, encryptionKey), Room (para videollamadas), Transaction (para pagos), y AuditLog (acción, userId, detalles). Asegúrate de incluir relaciones correctas y timestamps (`createdAt`, `updatedAt`)."

### 3. Sistema de Auth + RBAC en NestJS
> "Escribe el código para un módulo de autenticación en NestJS usando Passport y JWT. Proporciona: 1) `auth.service.ts` con métodos `register` (haciendo hash con bcrypt) y `login`. 2) `jwt.strategy.ts`. 3) Un decorador personalizado `@Roles()` para RBAC. 4) Un `RolesGuard` que lea el JWT y verifique si el usuario tiene el rol requerido usando Reflector. Usa TypeScript estricto."

### 4. CRUD de Startups + Marketplace
> "Crea un servicio en NestJS (`startups.service.ts`) y su controlador que implemente un CRUD para el modelo `Startup`. Incluye un endpoint público `GET /startups/marketplace` que soporte paginación, búsqueda por texto en el nombre/descripción, y filtrado por `sector` y `stage`. Usa PrismaClient. Proporciona también los DTOs usando `class-validator`."

### 5. Sistema de WebSocket + Salas de Video (Backend)
> "Escribe un Gateway de Socket.IO en NestJS (`pitch-rooms.gateway.ts`) para gestionar salas de videollamada. Necesito los siguientes eventos: `joinRoom`, `leaveRoom`, `offer` (WebRTC), `answer` (WebRTC), `iceCandidate` (WebRTC). Además, crea una lógica donde el servidor emita un evento `timerSync` cada segundo contando de 5 minutos a 0 para una sala específica. Utiliza el módulo `@nestjs/platform-socket.io`."

### 6. Integración Stripe (Pagos)
> "Crea un servicio en NestJS (`stripe.service.ts`) usando el SDK de `stripe`. Necesito un método `createCheckoutSession` que reciba un `priceId`, el `userId` y devuelva la URL de la sesión de Stripe. Luego, escribe un controlador `webhooks.controller.ts` con un endpoint POST `/webhooks/stripe` que valide la firma del webhook de Stripe usando el webhook secret, y maneje el evento `checkout.session.completed` para actualizar la base de datos (ej. actualizar el rol del usuario a premium)."

### 7. Integración Binance Pay (Cripto)
> "Crea un servicio en NestJS (`binance.service.ts`) para crear órdenes de pago usando la API de Binance Pay. El método `createOrder` debe hacer una petición HTTP POST a `https://bpay.binanceapi.com/binancepay/openapi/v2/order`. Debes implementar la lógica para generar la firma (signature) requerida por Binance Pay (HMAC SHA512 usando el API Key, Secret Key, un nonce aleatorio y el timestamp). Devuelve el código de TypeScript exacto."

### 8. Integración Google Calendar
> "Escribe un servicio en NestJS (`google-calendar.service.ts`) usando `googleapis`. Implementa un método `getAuthUrl()` que devuelva la URL de consentimiento de OAuth2. Implementa `getTokens(code: string)` para intercambiar el código por tokens de acceso. Finalmente, implementa `createEvent(accessToken, eventDetails)` que cree un evento de calendario con Google Meet incluido (`conferenceData`)."

### 9. Frontend: Dashboard del Inversionista
> "Crea un componente de página en Next.js 14 App Router (`page.tsx`) para el Marketplace de Inversionistas. Usa Tailwind CSS y asume que tienes componentes de Shadcn UI (Card, Input, Select, Button). La página debe tener una barra lateral de filtros (Sector, Etapa de inversión) y un grid principal que haga fetch a `/api/startups/marketplace` mostrando tarjetas por cada startup con su nombre, descripción corta, meta de fondeo y un botón de 'Ver Perfil'."

### 10. Frontend: Sala de Pitch (WebRTC)
> "Escribe un Custom Hook en React (`useWebRTC.ts`) para manejar conexiones peer-to-peer de video en una sala grupal. Debe gestionar un objeto `RTCPeerConnection` por cada usuario remoto, capturar el media local con `navigator.mediaDevices.getUserMedia`, y usar Socket.IO para el intercambio de señalización (offer, answer, ice-candidates). Luego, crea un componente `VideoRoom.tsx` que use este hook y renderice las etiquetas `<video>`."

---

## D. VARIABLES DE ENTORNO

Crea un archivo `.env` en la raíz y en cada app/servicio según corresponda. Aquí está el `.env.example` completo:

```env
# ==========================================
# BASE DE DATOS Y CACHÉ (Docker)
# ==========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/incubator_db?schema=public"
REDIS_URL="redis://localhost:6379"

# ==========================================
# BACKEND API (NestJS)
# ==========================================
PORT=3001
JWT_SECRET="super-secret-jwt-key-change-in-prod"
JWT_EXPIRATION="7d"
# Clave AES-256 para cifrado de Pitch Decks (exactamente 32 caracteres)
ENCRYPTION_KEY="12345678901234567890123456789012" 

# ==========================================
# ALMACENAMIENTO (MinIO/S3)
# ==========================================
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL="false"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="pitch-decks"

# ==========================================
# PAGOS (Stripe)
# ==========================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PREMIUM_PRICE_ID="price_..."

# ==========================================
# PAGOS CRIPTO (Binance Pay)
# ==========================================
BINANCE_PAY_API_KEY="your_binance_api_key"
BINANCE_PAY_SECRET_KEY="your_binance_secret_key"

# ==========================================
# CALENDARIOS (OAuth)
# ==========================================
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:3001/api/calendar/google/callback"

OUTLOOK_CLIENT_ID="..."
OUTLOOK_CLIENT_SECRET="..."
OUTLOOK_REDIRECT_URI="http://localhost:3001/api/calendar/outlook/callback"

# ==========================================
# FRONTEND (Next.js)
# ==========================================
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

---

## E. CHECKLIST DE ENTREGA FINAL

Utiliza esta lista para verificar que el proyecto cumple con todos los requisitos antes de la demostración:

- [ ] **Monorepo y Docker:** `docker-compose up` levanta todas las dependencias locales y el monorepo compila sin errores.
- [ ] **Auth Funcional:** Registro y Login emiten JWT correctamente. Rutas protegidas según el rol.
- [ ] **CRUD Startups:** Creación y edición de perfiles de startup operativos.
- [ ] **Cifrado AES-256:** Los archivos PDF subidos como Pitch Decks no son legibles directamente desde MinIO sin la clave de descifrado del backend.
- [ ] **Marketplace:** Filtros por sector y etapa funcionando correctamente en el frontend.
- [ ] **Video en Tiempo Real:** Las salas WebRTC permiten ver y escuchar a otros participantes.
- [ ] **Cronómetro Sincronizado:** El WebSocket transmite el tiempo restante a todos los participantes sin desfasaje.
- [ ] **Pagos Stripe:** Compra de planes emite un evento al webhook y actualiza la BD local.
- [ ] **Pagos Binance:** Integración al menos en sandbox comprobando generación de orden de pago.
- [ ] **Agendamiento:** Conexión OAuth de Google/Outlook exitosa y capacidad de crear un evento de prueba.
- [ ] **Auditoría:** Dashboard de admin muestra logs de acciones importantes.
- [ ] **Diseño Responsivo:** Plataforma usable en dispositivos móviles.
- [ ] **Documentación:** `README.md` incluye comandos claros de instalación y testing.
- [ ] **Demo:** Flujo feliz grabado en video o probado exhaustivamente.
