import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/error.js';

export class CalendarService {
  async getMyEvents(userId: string) {
    return prisma.calendarEvent.findMany({
      where: { userId },
      include: {
        tickets: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async getAllPublicEvents() {
    return prisma.calendarEvent.findMany({
      orderBy: { startTime: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async createEvent(userId: string, data: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
  }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Formato de fecha u hora inválido', 400);
    }

    const now = Date.now();
    if (start.getTime() < now - 60000) { // allow 1 min clock skew
      throw new AppError('La fecha y hora de inicio debe ser futura', 400);
    }

    const minDurationMs = 15 * 60 * 1000; // 15 mins
    const maxDurationMs = 24 * 60 * 60 * 1000; // 24 hours

    if (end.getTime() - start.getTime() < minDurationMs) {
      throw new AppError('La duración mínima de un evento es de 15 minutos', 400);
    }

    if (end.getTime() - start.getTime() > maxDurationMs) {
      throw new AppError('La duración máxima de un evento es de 24 horas', 400);
    }

    return prisma.calendarEvent.create({
      data: {
        userId,
        title: data.title.trim().slice(0, 150),
        description: data.description?.trim().slice(0, 2000),
        startTime: start,
        endTime: end,
      },
    });
  }

  async deleteEvent(eventId: string, userId: string, userRole: string) {
    const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('Evento no encontrado', 404);

    if (event.userId !== userId && userRole !== 'ADMIN') {
      throw new AppError('No autorizado para eliminar este evento', 403);
    }

    await prisma.calendarEvent.delete({ where: { id: eventId } });
    return true;
  }
}
