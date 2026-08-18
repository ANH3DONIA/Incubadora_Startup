import { Router } from 'express';
import { CalendarController } from './calendar.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/public', CalendarController.getAllEvents);
router.get('/my', authenticate, CalendarController.getMyEvents);
router.post('/', authenticate, CalendarController.createEvent);
router.delete('/:id', authenticate, CalendarController.deleteEvent);

export default router;
