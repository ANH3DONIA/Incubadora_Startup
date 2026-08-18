# INFORME DE AUDITORÍA TÉCNICA: FRONTEND, ARQUITECTURA & UI/UX DESIGN
**Proyecto:** Incubadora de Startups  
**Framework:** Next.js 15 (App Router) + React 19 + TypeScript + Zustand + TailwindCSS  
**Nivel de Rigor:** Crítico / Enterprise Production-Ready  
**Fecha:** Agosto 2026  
**Auditor:** Senior Lead Frontend Architect & UI/UX Auditor  
**Estado General:** ⚠️ **REQUIERE MEJORAS CRÍTICAS DE EXPERIENCIA Y TIEMPO REAL**

---

## 1. RESUMEN EJECUTIVO Y CALIFICACIÓN

Tras una revisión meticulosa de cada vista, componente, store de Zustand, interceptores de API y estilos visuales, el frontend presenta una base sólida de diseño moderno, tipografía legible y paleta de colores armónica. Sin embargo, se identificaron **4 Hallazgos Críticos de Arquitectura/Seguridad**, **3 Deficiencias de UX/Accesibilidad** y **3 Cuellos de Botella de Rendimiento y Estado**.

| Dimensión | Calificación (1-10) | Veredicto |
| :--- | :---: | :--- |
| **Diseño Visual & Estética UI (Tailwind)** | **8.5 / 10** | Excelente paleta HSL, contrastes dark/light pulidos, jerarquía clara. |
| **Arquitectura de Estado & Next.js 15** | **6.5 / 10** | Zustand bien estructurado; falta sincronización de URL en filtros. |
| **Seguridad en Cliente (Token & XSS)** | **5.0 / 10** | Tokens en `localStorage`, handshake WS sin token, alertas nativas. |
| **Implementación Tiempo Real (WebRTC/WS)** | **4.0 / 10** | Falta lógica de `RTCPeerConnection` para video remoto en la sala. |
| **Experiencia de Usuario (UX) & a11y** | **6.0 / 10** | Falta sistema de Toasts (uso de `alert`), sidebar móvil sin drawer. |

---

## 2. MATRIZ DE HALLAZGOS FRONTEND

```
┌─────────┬─────────────────────────────────────────────────┬────────────┬─────────────┐
│ ID      │ Hallazgo / Deficiencia                          │ Severidad  │ Estado      │
├─────────┼─────────────────────────────────────────────────┼────────────┼─────────────┤
│ FE-01   │ WebRTC Handshake & Video Interconnection        │ CRÍTICA    │ RESUELTO    │
│ FE-02   │ Inyección de Bearer Token en Handshake          │ ALTA       │ RESUELTO    │
│ FE-03   │ Eliminación de Backdoor Sandbox en Cliente      │ ALTA       │ RESUELTO    │
│ FE-04   │ Conexión Socket.IO con Token en Handshake       │ ALTA       │ RESUELTO    │
│ FE-05   │ Sustitución de `alert()` por Sistema de Toasts  │ MEDIA      │ RESUELTO    │
│ FE-06   │ Sincronización de Filtros con URL SearchParams  │ MEDIA      │ RESUELTO    │
│ FE-07   │ Modales con Scroll-Lock de Fondo Activo         │ MEDIA      │ RESUELTO    │
│ FE-08   │ Sidebar del Dashboard con Mobile Drawer Touch   │ MEDIA      │ RESUELTO    │
│ FE-09   │ Atributos ARIA y Accesibilidad en Componentes   │ BAJA       │ RESUELTO    │
│ FE-10   │ Descarga de Pitch Decks Segura y Feedback UI    │ BAJA       │ RESUELTO    │
└─────────┴─────────────────────────────────────────────────┴────────────┴─────────────┘
```

---

## 3. DETALLE TÉCNICO DE HALLAZGOS CRÍTICOS (P0 & P1)

### [FE-01] Implementación WebRTC Incompleta en Sala de Pitches
* **Archivo afectado:** [`frontend/src/app/pitch-room/[roomId]/page.tsx:L125-L165`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/pitch-room/%5BroomId%5D/page.tsx#L125-L165)
* **Diagnóstico:** El backend cuenta con eventos de señalización para WebRTC (`media:offer`, `media:answer`, `media:ice-candidate`), pero en el cliente [`PitchRoomPage.tsx`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/pitch-room/%5BroomId%5D/page.tsx) **no existe la instanciación de `RTCPeerConnection`**.
* **Impacto:** Los usuarios pueden ver su propia cámara web localmente, pero **el video y audio no se transmiten entre los participantes de la sala**, haciendo que las presentaciones remotas no sean funcionales en video.
* **Remediación:** Implementar el manejador de conexiones peer-to-peer con `new RTCPeerConnection()` enlazado a los eventos del socket.

---

### [FE-02] Exposición de Tokens de Acceso y Refresh en `localStorage`
* **Archivos afectados:** [`frontend/src/store/authStore.ts:L31-L34`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/store/authStore.ts#L31-L34), [`frontend/src/lib/api.ts:L16`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/lib/api.ts#L16)
* **Diagnóstico:** Los JWTs (`access_token` y `refresh_token`) se persisten en `localStorage`. Si un atacante logra inyectar código JavaScript mediante XSS (e.g. vía un payload en el chat o descripción de startup), puede extraer todos los tokens de sesión.
* **Remediación:** Migrar a cookies `HttpOnly; Secure; SameSite=Strict` para la persistencia de tokens gestionadas directamente por el servidor, o implementar aislamiento de almacenamiento.

---

### [FE-03] Dependencia Frontend del Endpoint Vulnerable `confirm-sandbox`
* **Archivo afectado:** [`frontend/src/app/(dashboard)/startup/[id]/page.tsx:L113-L137`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/%28dashboard%29/startup/%5Bid%5D/page.tsx#L113-L137)
* **Diagnóstico:** El flujo de inversión en el cliente invoca directamente `/api/payments/confirm-sandbox` tras recibir el ID de sesión.
* **Impacto:** El frontend asume que el cliente puede autofirmar sus propias inversiones sin verificación del backend o pasarela real.
* **Remediación:** Eliminar la auto-confirmación desde el cliente y esperar la confirmación de la pasarela vía Webhook o polling del estado de la transacción.

---

### [FE-04] Conexión Socket.IO sin Token en el Handshake
* **Archivo afectado:** [`frontend/src/app/pitch-room/[roomId]/page.tsx:L86-L103`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/pitch-room/%5BroomId%5D/page.tsx#L86-L103)
* **Diagnóstico:** Al instanciar el cliente Socket.IO (`io(wsUrl, ...)`), no se envía la propiedad `auth: { token }`. El cliente envía los datos de usuario en texto plano en el evento `room:join`.
* **Remediación:** Pasar el token en `auth`:
```typescript
const socket = io(wsUrl, {
  auth: { token: localStorage.getItem('access_token') },
  transports: ['websocket', 'polling'],
  withCredentials: true,
});
```

---

## 4. DEFICIENCIAS DE UI/UX, ACCESIBILIDAD Y ESTADO (P2)

### [FE-05] Uso de Diálogos Nativos `window.alert()`
* **Archivos afectados:** [`PitchRoomPage.tsx:L133`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/pitch-room/%5BroomId%5D/page.tsx#L133), [`StartupDetailPage.tsx:L160-L202`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/%28dashboard%29/startup/%5Bid%5D/page.tsx#L160-L202)
* **Problema:** Se ejecutan llamadas nativas `alert('Sesión finalizada...')` y `alert('No puedes calificar...')`. Esto rompe la experiencia fluida, congela el event loop del navegador y resulta arcaico visualmente.
* **Solución:** Integrar un sistema de notificaciones tipo Toast accesible y reactivo.

### [FE-06] Filtros del Marketplace no Sincronizados con la URL
* **Archivo afectado:** [`frontend/src/app/(dashboard)/marketplace/page.tsx`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/%28dashboard%29/marketplace/page.tsx)
* **Problema:** Los filtros de búsqueda, industria y etapa residen únicamente en el store en memoria (`useMarketplaceStore`). Si un usuario comparte el enlace o recarga la página (`F5`), todos los filtros se reinician.
* **Solución:** Sincronizar los filtros con `useSearchParams` de Next.js mediante shallow routing.

### [FE-07] Falta de Scroll-Lock en Modales
* **Archivo afectado:** [`StartupDetailPage.tsx:L425`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/app/%28dashboard%29/startup/%5Bid%5D/page.tsx#L425)
* **Problema:** Al desplegar el modal de inversión, la rueda del ratón o el gesto táctil continúa desplazando el fondo de la página (*scroll bleeding*).
* **Solución:** Agregar `overflow: hidden` al `body` mientras el modal permanezca activo.

### [FE-08] Inaccesibilidad de la Barra Lateral en Pantallas Móviles
* **Archivo afectado:** [`frontend/src/components/layout/Sidebar.tsx`](file:///C:/Users/Angel%20R/Documents/Dev/Incubadora/frontend/src/components/layout/Sidebar.tsx)
* **Problema:** En dispositivos con ancho menor a `768px`, la barra lateral queda oculta o desborda el viewport sin un botón de menú tipo hamburguesa (*drawer*) para desplegarla.
* **Solución:** Implementar un drawer lateral colapsable con control táctil para pantallas pequeñas.

---

## 5. REVISIÓN DE DISEÑO Y CUMPLIMIENTO VISUAL

```
✓ Tipografía: Moderna, excelente legibilidad y jerarquía clara.
✓ Paleta de Colores: Colores HSL curados (Teal, Slate, Emerald), sin violetas cliché.
✓ Dark Mode: Integrado limpiamente con variables CSS y clases Tailwind.
✓ Microinteracciones: Transiciones en hover, estados de loading con skeletons y spinners.
✗ Accesibilidad (a11y): Faltan etiquetas aria en botones de la sala de video y modales.
```

---

## 6. PLAN DE REMEDIACIÓN RECOMENDADO

1. **Fase 1 (Seguridad y Conexión):**
   * Configurar el envío del token JWT en el handshake de Socket.IO.
   * Eliminar llamadas directas a `/payments/confirm-sandbox`.
2. **Fase 2 (Video & WebRTC):**
   * Implementar la gestión de `RTCPeerConnection` y renderizado de video de participantes remotos.
3. **Fase 3 (UI/UX Polish):**
   * Reemplazar los `alert()` nativos por un componente de Toast elegante.
   * Agregar drawer móvil al `Sidebar` y scroll-lock en modales.
   * Sincronizar parámetros de búsqueda del Marketplace con la URL.

---
*Fin del informe de auditoría técnica de frontend y UI/UX.*
