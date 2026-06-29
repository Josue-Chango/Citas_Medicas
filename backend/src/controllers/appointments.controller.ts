import { Request, Response } from 'express';
import { crearCita, obtenerCitasPorPaciente, solicitarCancelacion, confirmarCancelacion, confirmarCita } from '../services/appointments.service';
import { enviarConfirmacion, enviarSolicitudCancelacion } from '../services/notifications.service';
import prisma from '../data/database';

export async function reservarCita(req: Request, res: Response): Promise<void> {
  const pacienteId = (req as any).userId;
  const cita = await crearCita(pacienteId, req.body);
  if ('error' in cita) {
    res.status(400).json({ error: cita.error });
    return;
  }
  const paciente = await prisma.user.findUnique({ where: { id: pacienteId } });
  if (!paciente) { res.status(404).json({ error: 'Paciente no encontrado' }); return; }
  const evento = await enviarConfirmacion(cita, paciente.email);
  res.status(201).json({ cita, notificacion: evento });
}

export async function listarCitas(req: Request, res: Response): Promise<void> {
  const pacienteId = (req as any).userId;
  const citas = await obtenerCitasPorPaciente(pacienteId);
  const citasConDoctor = citas.map(c => ({
    ...c,
    medicoNombre: c.medico.nombre,
  }));
  res.json(citasConDoctor);
}

export async function confirmarCitaHandler(req: Request, res: Response): Promise<void> {
  const { citaId, token } = req.body;
  if (!citaId || !token) {
    res.status(400).json({ error: 'citaId y token son requeridos' });
    return;
  }
  const result = await confirmarCita(citaId, token);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ message: 'Cita confirmada exitosamente', cita: result });
}

export async function cancelarCitaHandler(req: Request, res: Response): Promise<void> {
  const pacienteId = (req as any).userId;
  const id = req.params.id as string;
  const resultado = await solicitarCancelacion(pacienteId, id);
  if ('error' in resultado) {
    res.status(400).json({ error: resultado.error });
    return;
  }
  const paciente = await prisma.user.findUnique({ where: { id: pacienteId } });
  if (!paciente) { res.status(404).json({ error: 'Paciente no encontrado' }); return; }
  const evento = await enviarSolicitudCancelacion(resultado, paciente.email);
  res.json({ cita: resultado, notificacion: evento });
}

export async function confirmarCancelacionHandler(req: Request, res: Response): Promise<void> {
  const { citaId, token } = req.body;
  if (!citaId || !token) {
    res.status(400).json({ error: 'citaId y token son requeridos' });
    return;
  }
  const result = await confirmarCancelacion(citaId, token);
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json({ message: 'Cita cancelada exitosamente', cita: result });
}
