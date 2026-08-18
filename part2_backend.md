## A. SISTEMA DE AUTENTICACIÓN

### Schemas Zod de Validación

```typescript
// src/modules/auth/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales'),
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    role: z.enum(['ENTREPRENEUR', 'INVESTOR']),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  })
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'El Refresh Token es requerido'),
  })
});

export type RegisterDto = z.infer<typeof registerSchema>['body'];
export type LoginDto = z.infer<typeof loginSchema>['body'];
export type RefreshDto = z.infer<typeof refreshSchema>['body'];
```

### Middleware de Autenticación

```typescript
// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError } from '../utils/error';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No autorizado, token faltante', 401);
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as {
      userId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      throw new AppError('Usuario no encontrado o inactivo', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Token inválido o expirado', 401));
  }
};
```

### Auth Service

```typescript
// src/modules/auth/auth.service.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/error';
import { RegisterDto, LoginDto } from './auth.schema';

export class AuthService {
  private generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async register(data: RegisterDto) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new AppError('El email ya está registrado', 400);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      }
    });

    const tokens = this.generateTokens(user.id);
    
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { user: { id: user.id, email: user.email, role: user.role }, tokens };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.isActive) throw new AppError('Credenciales inválidas', 401);

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) throw new AppError('Credenciales inválidas', 401);

    const tokens = this.generateTokens(user.id);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { user: { id: user.id, email: user.email, role: user.role }, tokens };
  }

  async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { userId: string };
      const storedToken = await prisma.refreshToken.findFirst({
        where: { token, userId: decoded.userId, revokedAt: null }
      });

      if (!storedToken) throw new AppError('Refresh token inválido', 401);

      // Revocar token actual (Rotate)
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() }
      });

      const tokens = this.generateTokens(decoded.userId);
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: decoded.userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });

      return tokens;
    } catch {
      throw new AppError('Refresh token expirado o inválido', 401);
    }
  }

  async logout(token: string) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revokedAt: new Date() }
    });
  }
}
```

### Auth Controller

```typescript
// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refresh(refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    res.status(200).json({ success: true, data: req.user });
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await authService.logout(refreshToken);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) { next(error); }
  }
}
```

### Auth Routes

```typescript
// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshSchema } from './auth.schema';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.post('/refresh', validateRequest(refreshSchema), AuthController.refresh);
router.post('/logout', AuthController.logout);
router.get('/me', authenticate, AuthController.me);

export default router;
```

## B. SISTEMA RBAC (Control de Acceso por Roles)

### Matriz de Permisos

| Endpoint | Método | ENTREPRENEUR | INVESTOR | ADMIN |
|----------|--------|--------------|----------|-------|
| `/api/startups` | POST | ✅ | ❌ | ✅ |
| `/api/startups` | GET | ✅ | ✅ | ✅ |
| `/api/startups/:id` | GET | ✅ | ✅ | ✅ |
| `/api/startups/:id` | PUT | ✅ (solo propias) | ❌ | ✅ |
| `/api/startups/:id` | DELETE | ✅ (solo propias) | ❌ | ✅ |
| `/api/startups/:id/pitch-deck` | POST | ✅ (solo propias) | ❌ | ✅ |
| `/api/startups/:id/pitch-deck` | GET | ✅ (propias) | ✅ (si hizo match) | ✅ |
| `/api/pitch-sessions` | POST | ❌ | ❌ | ✅ |
| `/api/pitch-sessions/:id/start` | PATCH | ✅ (solo presenter) | ❌ | ✅ |
| `/api/payments/*` | POST | ✅ | ✅ | ✅ |
| `/api/matchmaking/*` | GET/POST | ❌ | ✅ | ✅ |
| `/api/ratings` | POST | ❌ | ✅ | ✅ |
| `/api/admin/*` | TODOS | ❌ | ❌ | ✅ |

### Middleware RBAC

```typescript
// src/middlewares/rbac.middleware.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { AppError } from '../utils/error';

type Role = 'ENTREPRENEUR' | 'INVESTOR' | 'ADMIN';

export const authorize = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Usuario no autenticado', 401));
    }
    
    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(new AppError('No tienes permisos suficientes', 403));
    }

    next();
  };
};
```

## C. TODOS LOS ENDPOINTS DEL API

### Startups

#### POST /api/startups
- **Roles:** `ENTREPRENEUR`, `ADMIN`
- **Controller & Service Snippet:**
```typescript
const createStartupSchema = z.object({
  body: z.object({
    name: z.string(),
    description: z.string(),
    industry: z.string(),
    fundingGoal: z.number().positive(),
  })
});

// controller
static async create(req: AuthRequest, res: Response) {
  const startup = await startupService.create(req.body, req.user!.id);
  res.status(201).json({ success: true, data: startup });
}
```

#### POST /api/startups/:id/pitch-deck
- **Roles:** `ENTREPRENEUR` (propias), `ADMIN`
- **Detalle:** Sube documento cifrado AES-256.
```typescript
// service
async uploadPitchDeck(startupId: string, userId: string, fileBuffer: Buffer) {
  const startup = await prisma.startup.findUnique({ where: { id: startupId } });
  if (startup?.userId !== userId) throw new AppError('Forbidden', 403);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.ENCRYPTION_KEY!), iv);
  let encrypted = cipher.update(fileBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const uploadUrl = await s3Service.uploadBuffer(encrypted, `decks/${startupId}.pdf`);
  return prisma.startup.update({ where: { id: startupId }, data: { pitchDeckUrl: uploadUrl } });
}
```

### Payments (Stripe)

#### POST /api/payments/checkout
- **Roles:** `ENTREPRENEUR`, `INVESTOR`
```typescript
const checkoutSchema = z.object({
  body: z.object({ priceId: z.string(), successUrl: z.string(), cancelUrl: z.string() })
});

// service
async createCheckout(priceId: string, userId: string, urls: { successUrl: string, cancelUrl: string }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'payment',
    success_url: urls.successUrl,
    cancel_url: urls.cancelUrl,
    client_reference_id: userId,
  });
  return { url: session.url };
}
```

#### POST /api/webhooks/stripe
```typescript
// controller (express.raw middleware applies here)
static async stripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    await paymentService.processSuccessfulPayment(session.client_reference_id!, session.amount_total!);
  }
  res.json({ received: true });
}
```

### Payments (Binance Pay)

#### POST /api/payments/crypto/create-order
```typescript
// service
async createBinanceOrder(userId: string, amount: number, currency: string = 'USDT') {
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  const body = JSON.stringify({
    merchantId: process.env.BINANCE_MERCHANT_ID,
    merchantTradeNo: `ORDER_${Date.now()}`,
    tradeType: 'WEB',
    totalFee: amount,
    currency,
    productType: 'Digital',
    productName: 'Incubator Access',
    productDetail: 'Startup Incubator Platform Access'
  });

  const payload = `${timestamp}\n${nonce}\n${body}\n`;
  const signature = crypto.createHmac('sha512', process.env.BINANCE_SECRET_KEY!).update(payload).digest('hex');

  const response = await axios.post('https://bpay.binanceapi.com/binancepay/openapi/v3/order', body, {
    headers: {
      'BinancePay-Timestamp': timestamp.toString(),
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': process.env.BINANCE_API_KEY,
      'BinancePay-Signature': signature.toUpperCase(),
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}
```

### Admin

#### GET /api/admin/audit-logs
- **Roles:** `ADMIN`
```typescript
// controller
static async getAuditLogs(req: Request, res: Response) {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100
  });
  res.json({ success: true, data: logs });
}
```

## D. PROTOCOLO WEBSOCKET COMPLETO

### Eventos del Cliente → Servidor

| Evento | Payload | Descripción | Quién emite |
|--------|---------|-------------|-------------|
| `room:create` | `{ sessionId: string }` | Crea sala para una Pitch Session | Admin |
| `room:join` | `{ roomId: string }` | Se une a una sala existente | Todos |
| `room:leave` | `{ roomId: string }` | Sale de la sala | Todos |
| `pitch:start` | `{ roomId: string, startupId: string }` | Inicia la presentación (timer de 3/5 min) | Presenter |
| `pitch:end` | `{ roomId: string }` | Finaliza anticipadamente el pitch | Presenter/Admin |
| `chat:message` | `{ roomId: string, content: string }` | Envía mensaje al chat del pitch | Todos |
| `media:offer` | `{ target: string, sdp: RTCSessionDescriptionInit }` | Envía oferta WebRTC | Presenter |
| `media:answer` | `{ target: string, sdp: RTCSessionDescriptionInit }` | Responde oferta WebRTC | Viewers |
| `media:ice-candidate`| `{ target: string, candidate: RTCIceCandidate }` | Envía candidato ICE | Todos |

### Eventos del Servidor → Cliente

| Evento | Payload | Descripción |
|--------|---------|-------------|
| `room:created` | `{ roomId: string }` | Confirmación de sala creada |
| `room:joined` | `{ roomId: string, users: string[] }` | Confirmación de unión exitosa |
| `room:user-joined`| `{ userId: string, role: string }` | Notifica que otro usuario entró |
| `room:user-left` | `{ userId: string }` | Notifica que alguien salió |
| `pitch:started` | `{ startTime: Date, duration: number }` | Notifica inicio y resetea UI |
| `pitch:ended` | `{ reason: string }` | Notifica fin del pitch |
| `timer:tick` | `{ remainingSeconds: number }` | Broadcast cada segundo |
| `timer:warning` | `{ remainingSeconds: number }` | Emitido a los 60s, 30s, 10s |
| `timer:expired` | `{}` | Tiempo finalizado forzosamente |
| `chat:message` | `{ id: string, sender: string, content: string, time: Date }`| Broadcast de mensaje |
| `media:*` | `(RTCSessionDescriptionInit / RTCIceCandidate)` | Tráfico de señalización |

## E. MIDDLEWARE DE AUDITORÍA

```typescript
// src/middlewares/audit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';

export const auditLog = async (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function (body) {
    res.locals.responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    if (req.method !== 'GET') { // Solo registrar mutaciones por rendimiento
      const userId = (req as any).user?.id || 'ANONYMOUS';
      const userAgent = req.get('user-agent') || 'UNKNOWN';
      const ip = req.ip || req.socket.remoteAddress || 'UNKNOWN';
      
      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: `${req.method} ${req.originalUrl}`,
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            ipAddress: ip,
            userAgent,
            requestPayload: req.body ? JSON.stringify(req.body) : null,
          }
        });
      } catch (error) {
        console.error('Error saving audit log:', error);
      }
    }
  });

  next();
};
```
