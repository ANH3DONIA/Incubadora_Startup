import { Router } from 'express';
import { CalendarController } from './calendar.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { createEventSchema } from './calendar.schema.js';

const router = Router();

router.get('/public', CalendarController.getAllEvents);
router.get('/my', authenticate, CalendarController.getMyEvents);
router.post(
  '/',
  authenticate,
  validateRequest(createEventSchema),
  CalendarController.createEvent
);
router.delete('/:id', authenticate, CalendarController.deleteEvent);

export default router;

