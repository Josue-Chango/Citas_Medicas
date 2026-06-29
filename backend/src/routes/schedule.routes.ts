import { Router } from 'express';
import { listarEspecialidades, listarMedicos, verHorarios } from '../controllers/schedule.controller';

const router = Router();
router.get('/especialidades', listarEspecialidades);
router.get('/medicos/:especialidad', listarMedicos);
router.get('/horarios', verHorarios);

export default router;
