import { Router } from 'express';
import { PitchController } from './pitch.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { roomLookupLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
  createPitchSessionSchema,
  updatePitchStatusSchema,
  updatePitchSessionSchema,
  ratePitchSchema,
} from './pitch.schema.js';

const router = Router();

// Public & Authenticated reads
router.get('/upcoming', PitchController.getUpcoming);
router.get('/my', authenticate, authorize('ENTREPRENEUR', 'ADMIN'), PitchController.getMyPitches);
router.get('/room/:roomId', authenticate, roomLookupLimiter, PitchController.getRoom);
router.get('/:id', PitchController.getById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  validateRequest(createPitchSessionSchema),
  PitchController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  validateRequest(updatePitchSessionSchema),
  PitchController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  PitchController.delete
);

router.patch(
  '/:id/status',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  validateRequest(updatePitchStatusSchema),
  PitchController.updateStatus
);

router.post(
  '/:startupId/ratings',
  authenticate,
  authorize('INVESTOR', 'ADMIN'),
  validateRequest(ratePitchSchema),
  PitchController.rateStartup
);

export default router;

