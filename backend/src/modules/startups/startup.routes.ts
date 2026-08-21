import { Router } from 'express';
import multer from 'multer';
import { StartupController } from './startup.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/rbac.middleware.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { createStartupSchema, updateStartupSchema, startupQuerySchema } from './startup.schema.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  },
});

// Public / Authenticated read routes
router.get('/', validateRequest(startupQuerySchema), StartupController.findAll);
router.get('/my', authenticate, StartupController.getMyStartup);
router.get('/:id', StartupController.findById);

// Pitch Deck secure stream
router.get('/:id/pitch-deck/file', authenticate, StartupController.getPitchDeckFile);

// Protected mutation routes
router.post(
  '/',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  validateRequest(createStartupSchema),
  StartupController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  validateRequest(updateStartupSchema),
  StartupController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  StartupController.delete
);

router.post(
  '/:id/pitch-deck',
  authenticate,
  authorize('ENTREPRENEUR', 'ADMIN'),
  upload.single('pitchDeck'),
  StartupController.uploadPitchDeck
);

export default router;
