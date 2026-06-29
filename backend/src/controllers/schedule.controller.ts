import { Request, Response } from 'express';
import { obtenerEspecialidades, obtenerMedicosPorEspecialidad, obtenerHorariosDisponibles } from '../services/schedule.service';

export async function listarEspecialidades(_req: Request, res: Response): Promise<void> {
  res.json(await obtenerEspecialidades());
}

export async function listarMedicos(req: Request, res: Response): Promise<void> {
  const especialidad = req.params.especialidad as string;
  const medicos = await obtenerMedicosPorEspecialidad(especialidad);
  res.json(medicos);
}

export async function verHorarios(req: Request, res: Response): Promise<void> {
  const { medicoId, fecha } = req.query as { medicoId: string; fecha: string };
  if (!medicoId || !fecha) {
    res.status(400).json({ error: 'medicoId y fecha son requeridos' });
    return;
  }
  const horarios = await obtenerHorariosDisponibles(medicoId, fecha);
  res.json(horarios);
}
