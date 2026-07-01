import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { loginHandler, registerHandler, actualizarPerfilHandler, cambiarPasswordHandler } from '../controllers/auth.controller';

const router = Router();
router.post('/login', loginHandler);
router.post('/register', registerHandler);
router.put('/perfil', authMiddleware, actualizarPerfilHandler);
router.put('/password', authMiddleware, cambiarPasswordHandler);

export default router;
