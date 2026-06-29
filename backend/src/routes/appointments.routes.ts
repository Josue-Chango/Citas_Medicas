import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { reservarCita, listarCitas, cancelarCitaHandler, confirmarCitaHandler, confirmarCancelacionHandler } from '../controllers/appointments.controller';

const router = Router();
router.post('/confirmar', confirmarCitaHandler);
router.post('/cancelar-confirmar', confirmarCancelacionHandler);
router.use(authMiddleware);
router.post('/reservar', reservarCita);
router.put('/cancelar/:id', cancelarCitaHandler);
router.get('/', listarCitas);

export default router;
