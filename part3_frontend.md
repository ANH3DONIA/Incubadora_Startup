# PARTE 3: FRONTEND COMPLETO

## A. ESTRUCTURA DE PÁGINAS

### Páginas públicas

| Ruta | `/` |
| :--- | :--- |
| **Layout** | `PublicLayout` |
| **Componentes** | `Navbar`, `HeroSection`, `HowItWorks`, `FeaturedStartups`, `Testimonials`, `Footer` |
| **Datos (Endpoints)** | `GET /api/startups/featured`, `GET /api/testimonials` |
| **Permisos** | Público |
| **Descripción Visual** | Landing page moderna. Hero section con un título impactante, subtítulo explicativo y botones de "Inicia tu Startup" o "Invierte Ahora". Debajo, 3 columnas explicando el proceso. Luego un grid horizontal con las startups destacadas (cards) y testimonios en un carrusel. Footer con links legales y navegación. |

| Ruta | `/login` |
| :--- | :--- |
| **Layout** | `AuthLayout` |
| **Componentes** | `LoginForm`, `SocialLoginButtons` |
| **Datos (Endpoints)** | `POST /api/auth/login` |
| **Permisos** | Público (No autenticados) |
| **Descripción Visual** | Diseño minimalista. Formulario centrado en una tarjeta blanca sobre fondo gris claro o gradiente sutil. Campos de email y contraseña, botón de "Olvidé mi contraseña" y opciones de login social (Google, LinkedIn). |

| Ruta | `/register` |
| :--- | :--- |
| **Layout** | `AuthLayout` |
| **Componentes** | `RegisterForm`, `RoleSelector` |
| **Datos (Endpoints)** | `POST /api/auth/register` |
| **Permisos** | Público (No autenticados) |
| **Descripción Visual** | Similar a la página de login, pero inicia con un selector de roles visual (dos tarjetas grandes: "Soy Emprendedor" / "Soy Inversionista"). Al seleccionar, se muestra el formulario correspondiente con campos extra si aplica. |

### Páginas de Emprendedor

| Ruta | `/dashboard` |
| :--- | :--- |
| **Layout** | `EntrepreneurLayout` (incluye `Sidebar` y `Navbar` autenticado) |
| **Componentes** | `StatCard`, `StartupSummaryWidget`, `UpcomingPitchesWidget`, `InvestmentHistoryWidget` |
| **Datos (Endpoints)** | `GET /api/entrepreneur/stats`, `GET /api/startups/my`, `GET /api/pitches/upcoming` |
| **Permisos** | Emprendedor |
| **Descripción Visual** | Panel de control. Arriba, tarjetas de estadísticas (Total recaudado, Visitas al perfil, Rating). Abajo a la izquierda, un widget con el progreso de su perfil y botón para editar. A la derecha, lista de sus próximos eventos de pitch y un historial de inversiones recibidas en formato de tabla pequeña. |

| Ruta | `/my-startup` |
| :--- | :--- |
| **Layout** | `EntrepreneurLayout` |
| **Componentes** | `StartupForm`, `FileUpload`, `ProfilePreviewButton` |
| **Datos (Endpoints)** | `GET /api/startups/my`, `PUT /api/startups/my` |
| **Permisos** | Emprendedor |
| **Descripción Visual** | Formulario extenso dividido en tabs (Info General, Finanzas, Pitch Deck). Incluye zona de drag & drop para subir el PDF del Pitch Deck y logo de la empresa. Botón flotante para previsualizar cómo lo ven los inversionistas. |

| Ruta | `/my-startup/pitch-sessions` |
| :--- | :--- |
| **Layout** | `EntrepreneurLayout` |
| **Componentes** | `DataTable`, `CreatePitchModal`, `EmptyState` |
| **Datos (Endpoints)** | `GET /api/pitches/my`, `POST /api/pitches` |
| **Permisos** | Emprendedor |
| **Descripción Visual** | Header con título y botón "Crear Sesión". Si no hay sesiones, muestra ilustración (`EmptyState`). Si hay, muestra tabla con columnas: Fecha, Inversionistas inscritos, Estado, y Acciones (botón "Entrar a Sala" si está activa). |

| Ruta | `/pitch-room/[roomId]` |
| :--- | :--- |
| **Layout** | `RoomLayout` (Oculta navegación general para maximizar espacio) |
| **Componentes** | `VideoPlayer`, `InvestorGrid`, `PitchTimer`, `ChatPanel`, `WaitingRoom`, `ScreenShareButton` |
| **Datos (Endpoints)** | WebSockets (Socket.IO) + `GET /api/pitches/:id` |
| **Permisos** | Participantes confirmados de la sesión |
| **Descripción Visual** | Antes de la hora: `WaitingRoom` con cuenta regresiva. Activa: Área central grande para el video o pantalla compartida del emprendedor. Arriba en el centro, el `PitchTimer` gigante. A la derecha, el `ChatPanel` colapsable. Abajo (o en un sidebar), grid con videos en miniatura de los inversionistas. |

### Páginas de Inversionista

| Ruta | `/dashboard` |
| :--- | :--- |
| **Layout** | `InvestorLayout` |
| **Componentes** | `StatCard`, `StartupCarousel`, `PortfolioWidget`, `UpcomingPitchesWidget` |
| **Datos (Endpoints)** | `GET /api/investor/stats`, `GET /api/startups/match`, `GET /api/portfolio` |
| **Permisos** | Inversionista |
| **Descripción Visual** | Dashboard enfocado en oportunidades. Cards de estadísticas (Capital Invertido, Startups en portafolio, ROI estimado). Carrusel de startups recomendadas ("Matches") basándose en preferencias. Lista rápida de su portafolio actual. |

| Ruta | `/marketplace` |
| :--- | :--- |
| **Layout** | `InvestorLayout` |
| **Componentes** | `StartupCard`, `FilterSidebar`, `SearchBar`, `Pagination` |
| **Datos (Endpoints)** | `GET /api/startups` (con query params) |
| **Permisos** | Inversionista, Admin |
| **Descripción Visual** | Sidebar izquierdo con filtros (Industria con checkboxes, Etapa, Slider de rango de inversión, Ubicación). Barra superior con búsqueda por texto y ordenamiento. Área principal con un grid responsivo de `StartupCard`s. Paginación en la parte inferior. |

| Ruta | `/startup/[id]` |
| :--- | :--- |
| **Layout** | `InvestorLayout` |
| **Componentes** | `StartupHeader`, `PitchDeckViewer`, `TeamSection`, `ReviewSection`, `InvestCTA` |
| **Datos (Endpoints)** | `GET /api/startups/:id`, `GET /api/startups/:id/reviews` |
| **Permisos** | Inversionista, Admin |
| **Descripción Visual** | Header con logo, nombre y banner. Columna principal (70%) con descripción larga, problema/solución, visualizador PDF del pitch deck embebido, y miembros del equipo. Columna lateral (30%) con la meta de recaudación, progreso, próximos pitches de esta startup, y botón CTA grande "Invertir". |

| Ruta | `/invest/[startupId]` |
| :--- | :--- |
| **Layout** | `MinimalLayout` (Sin distracciones) |
| **Componentes** | `InvestmentModal` (renderizado como página), `PaymentMethodSelector`, `OrderSummary` |
| **Datos (Endpoints)** | `GET /api/startups/:id/investment-info`, `POST /api/investments` |
| **Permisos** | Inversionista |
| **Descripción Visual** | Proceso de checkout paso a paso. Paso 1: Input de monto con botones rápidos ($1K, $5K, $10K). Paso 2: `PaymentMethodSelector` (Stripe vs Binance Pay). Paso 3: Resumen de la transacción, términos legales y botón de confirmación final. |

### Páginas de Admin

| Ruta | `/admin` |
| :--- | :--- |
| **Layout** | `AdminLayout` |
| **Componentes** | `StatCard`, `ChartWidget` (Recharts), `RecentActivityList` |
| **Datos (Endpoints)** | `GET /api/admin/dashboard` |
| **Permisos** | Admin |
| **Descripción Visual** | Tablero denso con datos. Gráfico de líneas mostrando crecimiento de usuarios vs. inversiones en el tiempo. Listado de actividad en tiempo real (nuevos registros, nuevas sesiones creadas). |

| Ruta | `/admin/users` |
| :--- | :--- |
| **Layout** | `AdminLayout` |
| **Componentes** | `DataTable`, `UserActionMenu` |
| **Datos (Endpoints)** | `GET /api/admin/users`, `PUT /api/admin/users/:id/role` |
| **Permisos** | Admin |
| **Descripción Visual** | Tabla a pantalla completa con columnas: Nombre, Email, Rol, Estado, Fecha de Registro. Menú de tres puntos por fila para Banear, Cambiar Rol o Ver detalles. |

| Ruta | `/admin/startups` |
| :--- | :--- |
| **Layout** | `AdminLayout` |
| **Componentes** | `DataTable`, `ApprovalBadge` |
| **Datos (Endpoints)** | `GET /api/admin/startups`, `PUT /api/admin/startups/:id/status` |
| **Permisos** | Admin |
| **Descripción Visual** | Tabla listando startups. Incluye un filtro rápido arriba: "Pendientes de Aprobación", "Aprobadas", "Rechazadas". Botones de acción directa para Aprobar/Rechazar en la misma fila. |

| Ruta | `/admin/audit` |
| :--- | :--- |
| **Layout** | `AdminLayout` |
| **Componentes** | `AuditLogTable`, `DateRangePicker` |
| **Datos (Endpoints)** | `GET /api/admin/audit` |
| **Permisos** | SuperAdmin |
| **Descripción Visual** | Tabla muy técnica. Columnas: Timestamp, Usuario, Acción, Recurso, IP. Incluye selector de fechas complejo y botón para exportar a CSV/Excel. |

| Ruta | `/admin/finances` |
| :--- | :--- |
| **Layout** | `AdminLayout` |
| **Componentes** | `RevenueChart`, `DataTable` |
| **Datos (Endpoints)** | `GET /api/admin/finances` |
| **Permisos** | Admin |
| **Descripción Visual** | Panel con desglose de ingresos. Gráficos de pie (Suscripciones vs Tickets de eventos vs Comisiones). Tabla con últimas transacciones procesadas (Stripe y Binance). |

### Páginas Compartidas

| Ruta | `/events` |
| :--- | :--- |
| **Layout** | Según rol del usuario |
| **Componentes** | `CalendarView`, `EventList`, `TicketPurchaseModal` |
| **Datos (Endpoints)** | `GET /api/events` |
| **Permisos** | Autenticados |
| **Descripción Visual** | Vista híbrida: Arriba un calendario interactivo; al hacer clic en un día, se filtra la lista de abajo mostrando eventos (Pitches, Webinars). Cada evento tiene botón para comprar ticket o agregar a calendario. |

| Ruta | `/profile` |
| :--- | :--- |
| **Layout** | Según rol del usuario |
| **Componentes** | `ProfileForm`, `IntegrationSettings`, `SubscriptionManager` |
| **Datos (Endpoints)** | `GET /api/users/me`, `PUT /api/users/me` |
| **Permisos** | Autenticados |
| **Descripción Visual** | Formulario estándar de perfil. Tabs a la izquierda: Perfil General, Seguridad (Password/2FA), Integraciones (Google Calendar), y Suscripción (si aplica). |

| Ruta | `/pricing` |
| :--- | :--- |
| **Layout** | `PublicLayout` o `AppLayout` si está logueado |
| **Componentes** | `PricingCard`, `FeatureTable` |
| **Datos (Endpoints)** | `GET /api/plans` |
| **Permisos** | Público |
| **Descripción Visual** | Tres columnas grandes destacando los planes (Free, Pro, Enterprise). El plan central (Pro) ligeramente más grande y resaltado. Debajo, tabla detallada con checks y cruces comparando funcionalidades. |

---

## B. COMPONENTES REUTILIZABLES

### Navbar
```typescript
interface NavbarProps {
  role?: 'emprendedor' | 'inversionista' | 'admin' | null;
  transparent?: boolean;
}
```
**Descripción:** Barra de navegación superior. Adapta sus links (`Links`, `Menu`, `Avatar`) dependiendo del rol. Incluye notificaciones.
**Uso:** Todas las páginas a través de los Layouts.

### Sidebar
```typescript
interface SidebarProps {
  role: 'emprendedor' | 'inversionista' | 'admin';
  isOpen: boolean;
  onClose: () => void;
}
```
**Descripción:** Menú lateral de navegación, colapsable en móviles.
**Uso:** `/dashboard`, `/admin/*`, `/my-startup/*`

### StartupCard
```typescript
interface StartupCardProps {
  id: string;
  name: string;
  logoUrl: string;
  industry: string;
  shortDescription: string;
  raisedAmount: number;
  goalAmount: number;
  matchScore?: number;
}
```
**Descripción:** Tarjeta visual resumiendo la info de una startup. Muestra logo, nombre, pequeña descripción y barra de progreso de inversión.
**Uso:** `/marketplace`, `/dashboard` (Inversionista).

### PitchTimer
```typescript
interface PitchTimerProps {
  initialSeconds: number;
  isWarning: boolean;
  onTimeUp?: () => void;
}
```
**Descripción:** Cronómetro gigante. Cambia a color rojo parpadeante cuando queda poco tiempo (`isWarning`).
**Uso:** `/pitch-room/[roomId]`

### VideoPlayer
```typescript
interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  isMain?: boolean;
  userName: string;
}
```
**Descripción:** Wrapper para el elemento `<video>` HTML5 gestionando streams de WebRTC.
**Uso:** `/pitch-room/[roomId]`

### ChatPanel
```typescript
interface ChatPanelProps {
  roomId: string;
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
}
```
**Descripción:** Panel lateral de chat en vivo.
**Uso:** `/pitch-room/[roomId]`

### WaitingRoom
```typescript
interface WaitingRoomProps {
  eventName: string;
  startTime: Date;
  isHost: boolean;
  onStart?: () => void;
}
```
**Descripción:** Pantalla previa al ingreso de la sala de pitch, chequeo de cámara/micrófono y cuenta atrás.
**Uso:** `/pitch-room/[roomId]`

### InvestmentModal
```typescript
interface InvestmentModalProps {
  startupId: string;
  startupName: string;
  isOpen: boolean;
  onClose: () => void;
}
```
**Descripción:** Modal flotante o drawer para iniciar el proceso de inversión rápidamente.
**Uso:** `/startup/[id]`, `/marketplace`

### PaymentMethodSelector
```typescript
interface PaymentMethodSelectorProps {
  amount: number;
  onSelect: (method: 'stripe' | 'binance') => void;
}
```
**Descripción:** Selector de tabs con logos de Stripe (Fiat) y Binance (Cripto).
**Uso:** `/invest/[startupId]`

### RatingStars
```typescript
interface RatingStarsProps {
  rating: number;
  max?: number;
  readonly?: boolean;
  onChange?: (rating: number) => void;
}
```
**Descripción:** Componente SVG interactivo para calificación de 1 a 5 estrellas.
**Uso:** `/startup/[id]`, `/dashboard` (Emprendedor)

### AuditLogTable
```typescript
interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
}
```
**Descripción:** Variante de `DataTable` específica para formateo de IPs, JSON payloads y timestamps.
**Uso:** `/admin/audit`

### CalendarView
```typescript
interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
}
```
**Descripción:** Grilla de mes calendario marcando los días con eventos.
**Uso:** `/events`

### FileUpload
```typescript
interface FileUploadProps {
  accept: string;
  maxSizeMB: number;
  onUploadSuccess: (url: string) => void;
}
```
**Descripción:** Zona drag & drop para subir archivos (PDFs, imágenes) con barra de progreso.
**Uso:** `/my-startup`

### StatCard
```typescript
interface StatCardProps {
  title: string;
  value: string | number;
  trend?: number; // e.g., +5.2%
  icon: React.ReactNode;
}
```
**Descripción:** Tarjeta blanca pequeña para métricas clave.
**Uso:** Todos los `/dashboard` y `/admin`

### DataTable
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pagination?: boolean;
  searchable?: boolean;
}
```
**Descripción:** Wrapper dinámico sobre TanStack Table o shadcn Data Table.
**Uso:** Múltiples vistas de listas y admin.

### EmptyState
```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  imageUrl: string;
  action?: React.ReactNode;
}
```
**Descripción:** Componente mostrado cuando un array de datos está vacío.
**Uso:** `/my-startup/pitch-sessions`, `/dashboard`

### LoadingSpinner
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}
```
**Descripción:** Animación de carga centralizada.
**Uso:** Global (transiciones de suspense, fetchers).

### ProtectedRoute
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'emprendedor' | 'inversionista' | 'admin'>;
}
```
**Descripción:** Wrapper de componente que redirige a `/login` o `/403` si el usuario no tiene permisos.
**Uso:** App Router layouts o wrapper de páginas.

---

## C. ESTADO GLOBAL (ZUSTAND)

### authStore
Maneja la sesión, el token JWT y los datos del usuario logueado.

```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'emprendedor' | 'inversionista' | 'admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: (newToken: string) => void;
  setLoading: (loading: boolean) => void;
}
```

### roomStore
Maneja el estado complejo en tiempo real de una sala de pitch activa.

```typescript
import { create } from 'zustand';

interface Participant {
  id: string;
  name: string;
  role: string;
  hasAudio: boolean;
  hasVideo: boolean;
}

interface RoomState {
  currentRoomId: string | null;
  participants: Participant[];
  isConnected: boolean;
  timer: number;
  pitchStatus: 'waiting' | 'active' | 'qna' | 'finished';
  
  // Actions
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  updateParticipants: (participants: Participant[]) => void;
  setTimer: (seconds: number) => void;
  startPitch: () => void;
  setConnectionStatus: (status: boolean) => void;
}
```

### marketplaceStore
Maneja la vista y filtros de startups en el marketplace para evitar perder estado al navegar.

```typescript
import { create } from 'zustand';

interface Filters {
  industry: string[];
  stage: string[];
  minInvestment: number;
  maxInvestment: number;
  searchQuery: string;
}

interface MarketplaceState {
  startups: any[];
  filters: Filters;
  pagination: { page: number; limit: number; total: number };
  isLoading: boolean;
  
  // Actions
  setFilters: (filters: Partial<Filters>) => void;
  setPagination: (page: number) => void;
  fetchStartups: () => Promise<void>;
  resetFilters: () => void;
}
```

### notificationStore
Gestor de notificaciones in-app.

```typescript
import { create } from 'zustand';

interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  
  // Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'isRead' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}
```

---

## D. HOOKS PERSONALIZADOS

### 1. `useAuth()`
- **Parámetros:** Ninguno
- **Return Type:** Objeto con estado y acciones de autenticación (`{ user, isAuthenticated, login, logout, checkSession }`)
- **Descripción:** Abstracción sobre el `authStore` que incluye lógica de persistencia (localStorage/cookies) y validación del JWT.

### 2. `useSocket()`
- **Parámetros:** `url: string`, `options?: SocketOptions`
- **Return Type:** `{ socket: Socket, isConnected: boolean }`
- **Descripción:** Instancia, conecta y desconecta el cliente de Socket.IO, proveyendo un acceso global al socket activo.

### 3. `useRoom()`
- **Parámetros:** `roomId: string`
- **Return Type:** `{ join, leave, participants, sendMessage, isConnected, error }`
- **Descripción:** Encapsula la lógica de emitir/escuchar eventos de Socket.IO específicos de una sala (chat, unirse, salir, levantar la mano). Modifica el `roomStore`.

### 4. `useTimer()`
- **Parámetros:** `initialSeconds: number`, `onExpire?: () => void`
- **Return Type:** `{ seconds, isRunning, start, pause, reset, setSeconds }`
- **Descripción:** Hook de utilidad para manejar la cuenta regresiva del pitch exacto (usando `requestAnimationFrame` o intervalos limpios) independiente del componente visual.

### 5. `useWebRTC()`
- **Parámetros:** `roomId: string`, `localStream: MediaStream | null`
- **Return Type:** `{ peers, createOffer, createAnswer, toggleAudio, toggleVideo, screenShare }`
- **Descripción:** Hook complejo que maneja la inicialización de `RTCPeerConnection`, servidores ICE/STUN/TURN, intercambio de ofertas/respuestas y manejo dinámico de las pistas de video/audio de los participantes remotos.

### 6. `usePayment()`
- **Parámetros:** Ninguno
- **Return Type:** `{ processStripePayment, processBinancePayment, isLoading, error }`
- **Descripción:** Gestiona la comunicación con el backend para la creación de intenciones de pago (PaymentIntents) o la generación de códigos QR/URLs para Binance Pay.

### 7. `useMediaDevices()`
- **Parámetros:** `{ video: boolean; audio: boolean }`
- **Return Type:** `{ stream, error, isLoading, toggleCamera, toggleMic, activeDevices }`
- **Descripción:** Hook para pedir permisos al navegador (`navigator.mediaDevices.getUserMedia`), enumerar dispositivos disponibles (micrófonos/cámaras) y exponer el `MediaStream` local.
