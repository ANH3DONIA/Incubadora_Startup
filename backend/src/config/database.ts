import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let dbUrl = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');

if (dbUrl.includes('neon.tech') || dbUrl.includes('.aws.neon.')) {
  // Auto-corrección si el hostname de Neon quedó truncado o con comillas
  if (dbUrl.includes('.aws.neon.') && !dbUrl.includes('.aws.neon.tech')) {
    dbUrl = dbUrl.replace('.aws.neon.', '.aws.neon.tech/');
  } else if (dbUrl.includes('.aws.neon/') || dbUrl.includes('.aws.neon:')) {
    dbUrl = dbUrl.replace('.aws.neon', '.aws.neon.tech');
  }

  // Ensure query parameters for Neon PgBouncer
  try {
    const url = new URL(dbUrl);
    if (!url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require');
    }
    if (url.hostname.includes('-pooler') && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '30');
    }
    dbUrl = url.toString();
  } catch (_err) {
    if (!dbUrl.includes('sslmode=')) {
      dbUrl += dbUrl.includes('?') ? '&sslmode=require' : '?sslmode=require';
    }
    if (dbUrl.includes('-pooler') && !dbUrl.includes('pgbouncer=')) {
      dbUrl += '&pgbouncer=true';
    }
    if (!dbUrl.includes('connect_timeout=')) {
      dbUrl += '&connect_timeout=30';
    }
  }
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
