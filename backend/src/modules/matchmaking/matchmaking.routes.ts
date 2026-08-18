import { Router } from 'express';
import { MatchmakingController } from './matchmaking.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';

const router = Router();

router.use(authenticate, authorize('INVESTOR', 'ADMIN'));

router.get('/preferences', MatchmakingController.getPreferences);
router.put('/preferences', MatchmakingController.updatePreferences);
router.get('/matches', MatchmakingController.getMatches);

export default router;
