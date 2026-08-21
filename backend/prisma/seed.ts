import { PrismaClient, UserRole, PaymentMethodType, InvestmentStatus, PitchSessionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with comprehensive realistic academic demo data...');

  // 1. Clear existing records safely in order of dependencies
  await prisma.auditLog.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.investment.deleteMany({});
  await prisma.roomParticipant.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.pitchSession.deleteMany({});
  await prisma.startup.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.matchmakingPreference.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.calendarEvent.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = await bcrypt.hash('Password123!', 12);

  // 2. Create Users
  const [
    adminUser,
    entrepreneur1,
    entrepreneur2,
    entrepreneur3,
    investor1,
    investor2,
  ] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@incubator.com',
        passwordHash: defaultPassword,
        firstName: 'Carlos',
        lastName: 'Santana',
        role: UserRole.ADMIN,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      },
    }),
    prisma.user.create({
      data: {
        email: 'founder@fintech.io',
        passwordHash: defaultPassword,
        firstName: 'Elena',
        lastName: 'Gómez',
        role: UserRole.ENTREPRENEUR,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      },
    }),
    prisma.user.create({
      data: {
        email: 'sofia@biocure.health',
        passwordHash: defaultPassword,
        firstName: 'Sofía',
        lastName: 'Mendoza',
        role: UserRole.ENTREPRENEUR,
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      },
    }),
    prisma.user.create({
      data: {
        email: 'lucas@ecopulse.energy',
        passwordHash: defaultPassword,
        firstName: 'Lucas',
        lastName: 'Alvarado',
        role: UserRole.ENTREPRENEUR,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      },
    }),
    prisma.user.create({
      data: {
        email: 'investor@ventures.com',
        passwordHash: defaultPassword,
        firstName: 'Roberto',
        lastName: 'Kaufman',
        role: UserRole.INVESTOR,
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      },
    }),
    prisma.user.create({
      data: {
        email: 'valeria@angelcapital.co',
        passwordHash: defaultPassword,
        firstName: 'Valeria',
        lastName: 'Ríos',
        role: UserRole.INVESTOR,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      },
    }),
  ]);

  // 3. Create Startups
  const [startup1, startup2, startup3] = await Promise.all([
    prisma.startup.create({
      data: {
        userId: entrepreneur1.id,
        name: 'PayFlow AI',
        industry: 'Fintech',
        stage: 'Seed',
        fundingGoal: 250000,
        amountRaised: 145000,
        description:
          'Automatización inteligente de conciliación de pagos y prevención de fraude en tiempo real para Neobancos y E-commerce con modelos LLM y Web3.',
      },
    }),
    prisma.startup.create({
      data: {
        userId: entrepreneur2.id,
        name: 'BioCure Health',
        industry: 'Healthtech',
        stage: 'Pre-Seed',
        fundingGoal: 180000,
        amountRaised: 60000,
        description:
          'Plataforma de diagnóstico temprano con visión computacional aplicada a imágenes dermatológicas y telemedicina descentralizada.',
      },
    }),
    prisma.startup.create({
      data: {
        userId: entrepreneur3.id,
        name: 'EcoPulse Energy',
        industry: 'Cleantech',
        stage: 'Seed',
        fundingGoal: 400000,
        amountRaised: 280000,
        description:
          'Baterías modulares de flujo y gestión inteligente de microrredes solares para optimización de consumo industrial mediante IoT.',
      },
    }),
  ]);

  // 4. Create Pitch Sessions (Scheduled in future)
  const now = Date.now();
  const [pitch1, pitch2] = await Promise.all([
    prisma.pitchSession.create({
      data: {
        startupId: startup1.id,
        title: 'PayFlow AI - Ronda Seed Quick Pitch',
        scheduledFor: new Date(now + 2 * 3600 * 1000), // in 2 hours
        durationMinutes: 15,
        status: PitchSessionStatus.SCHEDULED,
        room: {
          create: {
            accessCode: 'PITCH1',
          },
        },
      },
      include: { room: true },
    }),
    prisma.pitchSession.create({
      data: {
        startupId: startup2.id,
        title: 'BioCure Health - Pre-Seed Demo',
        scheduledFor: new Date(now + 24 * 3600 * 1000), // tomorrow
        durationMinutes: 10,
        status: PitchSessionStatus.SCHEDULED,
        room: {
          create: {
            accessCode: 'PITCH2',
          },
        },
      },
      include: { room: true },
    }),
  ]);

  // 5. Create Investments (Fiat & Crypto)
  await prisma.investment.createMany({
    data: [
      {
        investorId: investor1.id,
        startupId: startup1.id,
        amount: 50000,
        paymentMethodType: PaymentMethodType.FIAT,
        transactionHash: 'ch_stripe_demo_001',
        status: InvestmentStatus.COMPLETED,
        currency: 'USD',
      },
      {
        investorId: investor2.id,
        startupId: startup1.id,
        amount: 25000,
        paymentMethodType: PaymentMethodType.CRYPTO,
        transactionHash: 'ORDER_BINANCE_PAY_77812',
        status: InvestmentStatus.COMPLETED,
        currency: 'USDT',
      },
      {
        investorId: investor1.id,
        startupId: startup3.id,
        amount: 100000,
        paymentMethodType: PaymentMethodType.FIAT,
        transactionHash: 'ch_stripe_demo_002',
        status: InvestmentStatus.COMPLETED,
        currency: 'USD',
      },
    ],
  });

  // 6. Create Ratings
  await prisma.rating.createMany({
    data: [
      {
        startupId: startup1.id,
        investorId: investor1.id,
        score: 5,
        feedback: 'Excelente tracción en el mercado Fintech B2B. El modelo de negocio es muy escalable.',
        isPublic: true,
      },
      {
        startupId: startup1.id,
        investorId: investor2.id,
        score: 4,
        feedback: 'Gran equipo fundador. Me gustaría ver métricas de retención de usuarios en el siguiente demo.',
        isPublic: true,
      },
      {
        startupId: startup2.id,
        investorId: investor1.id,
        score: 5,
        feedback: 'La tecnología de visión computacional tiene una precisión notable en sus pruebas piloto.',
        isPublic: true,
      },
    ],
  });

  // 7. Create Preferences for Investors
  await prisma.matchmakingPreference.createMany({
    data: [
      {
        userId: investor1.id,
        preferredIndustries: ['Fintech', 'AI', 'Cleantech'],
        preferredStages: ['Seed', 'Series A'],
        minTicketSize: 25000,
        maxTicketSize: 200000,
      },
      {
        userId: investor2.id,
        preferredIndustries: ['Healthtech', 'Fintech'],
        preferredStages: ['Pre-Seed', 'Seed'],
        minTicketSize: 10000,
        maxTicketSize: 100000,
      },
    ],
  });

  // 8. Create Calendar Events (Dynamic Masterclasses & Demo Days)
  await prisma.calendarEvent.createMany({
    data: [
      {
        userId: adminUser.id,
        title: 'Masterclass: Valuaciones y Cap Tables en Etapa Temprana',
        description: 'Taller práctico con Roberto Kaufman (Managing Partner en VC Ventures) sobre estructuras SAFE, notas convertibles y dilution modeling.',
        startTime: new Date(now + 3 * 24 * 3600 * 1000), // in 3 days
        endTime: new Date(now + 3 * 24 * 3600 * 1000 + 2 * 3600 * 1000),
      },
      {
        userId: adminUser.id,
        title: 'Demo Day Oficial: Cohorte Q3 2026',
        description: 'Presentación de las 10 mejores startups del programa de aceleración ante más de 40 inversionistas ángeles y fondos VC de Latinoamérica.',
        startTime: new Date(now + 7 * 24 * 3600 * 1000), // in 7 days
        endTime: new Date(now + 7 * 24 * 3600 * 1000 + 3 * 3600 * 1000),
      },
      {
        userId: investor1.id,
        title: 'Office Hours: Tesis de Inversión y Feedback de Pitch Decks',
        description: 'Sesión 1-on-1 abierta con el equipo de inversión para afinar propuestas de valor y métricas operativas.',
        startTime: new Date(now + 5 * 24 * 3600 * 1000), // in 5 days
        endTime: new Date(now + 5 * 24 * 3600 * 1000 + 1 * 3600 * 1000),
      },
    ],
  });

  // 9. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'POST /api/auth/register',
        method: 'POST',
        path: '/api/auth/register',
        statusCode: 201,
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        userId: entrepreneur1.id,
        action: 'POST /api/startups',
        method: 'POST',
        path: '/api/startups',
        statusCode: 201,
        ipAddress: '192.168.1.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      {
        userId: investor1.id,
        action: 'POST /api/payments/checkout',
        method: 'POST',
        path: '/api/payments/checkout',
        statusCode: 200,
        ipAddress: '181.42.12.98',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    ],
  });

  console.log('✅ Seeding completed successfully!');
  console.log('====================================================');
  console.log('👤 Admin:         admin@incubator.com / Password123!');
  console.log('👤 Emprendedor 1: founder@fintech.io  / Password123! (Startup: PayFlow AI)');
  console.log('👤 Emprendedor 2: sofia@biocure.health / Password123! (Startup: BioCure Health)');
  console.log('👤 Inversionista: investor@ventures.com / Password123!');
  console.log('🎥 Pitch 1 Code:  PITCH1');
  console.log('🎥 Pitch 2 Code:  PITCH2');
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
