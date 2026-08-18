export interface FinancialTransaction {
  id: string;
  investorId: string;
  startupId: string;
  amount: number | string;
  currency: string;
  paymentMethodType: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionHash: string;
  createdAt: string;
  investor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  startup?: {
    id: string;
    name: string;
    industry: string;
  };
}

export interface AdminUserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'ENTREPRENEUR' | 'INVESTOR';
  isActive?: boolean;
  isSuspended?: boolean;
  createdAt: string;
  startup?: {
    id: string;
    name: string;
  } | null;
}

export interface AuditLogEntry {
  id: string;
  userId?: string | null;
  action: string;
  resource: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface PitchSessionItem {
  id: string;
  roomId: string;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  startTime?: string | null;
  endTime?: string | null;
  createdAt: string;
}

export interface StartupRatingItem {
  id: string;
  score: number;
  feedback?: string | null;
  createdAt: string;
  investor?: {
    firstName: string;
    lastName: string;
  };
}

export interface PricingPlanItem {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  amount: number;
  code?: 'PRO' | 'ENTERPRISE';
}

export interface StartupPitchSession {
  id: string;
  title: string;
  scheduledFor: string;
  durationMinutes: number;
  room?: {
    id: string;
  };
}

export interface StartupDetailRating {
  id: string;
  score: number;
  feedback?: string | null;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}
