import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let dbUrl = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');

// Auto-corrección si el hostname de Neon quedó truncado o con comillas
if (dbUrl.includes('.aws.neon.') && !dbUrl.includes('.aws.neon.tech')) {
  dbUrl = dbUrl.replace('.aws.neon.', '.aws.neon.tech/');
} else if (dbUrl.includes('.aws.neon/') || dbUrl.includes('.aws.neon:')) {
  dbUrl = dbUrl.replace('.aws.neon', '.aws.neon.tech');
}

// Ensure sslmode=require for Neon
if (dbUrl.includes('neon.tech') && !dbUrl.includes('sslmode=')) {
  dbUrl += dbUrl.includes('?') ? '&sslmode=require' : '?sslmode=require';
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
