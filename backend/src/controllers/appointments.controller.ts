import { Request, Response } from 'express';
import { crearCita, obtenerCitasPorPaciente, solicitarCancelacion, confirmarCancelacion, confirmarCita, autoCancelarNoConfirmadas } from '../services/appointments.service';
import { enviarConfirmacion, enviarSolicitudCancelacion, enviarNoConfirmacionAuto, enviarPenalizacion } from '../services/notifications.service';
import { generarTokenConfirmacion } from '../services/appointments.service';
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

  const autoCanceladas = await autoCancelarNoConfirmadas();
  for (const ac of autoCanceladas) {
    await enviarNoConfirmacionAuto(ac.cita as any, ac.email).catch(() => {});
  }

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
  const evento = await enviarSolicitudCancelacion(resultado.cita, paciente.email, resultado.tienePenalizacion);
  res.json({ cita: resultado.cita, tienePenalizacion: resultado.tienePenalizacion, notificacion: evento });
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

  if (result.penalizado) {
    const cita = result.cita;
    const paciente = await prisma.user.findUnique({ where: { id: cita.pacienteId } });
    if (paciente) {
      await enviarPenalizacion(cita, paciente.email).catch(() => {});
    }
  }

  res.json({ message: 'Cita cancelada exitosamente', cita: result.cita, penalizado: result.penalizado });
}

export async function reenviarConfirmacionHandler(req: Request, res: Response): Promise<void> {
  const pacienteId = (req as any).userId;
  const id = req.params.id as string;
  const nuevoEmail = req.body.email as string | undefined;

  const cita = await prisma.appointment.findUnique({ where: { id } });
  if (!cita) { res.status(404).json({ error: 'Cita no encontrada' }); return; }
  if (cita.pacienteId !== pacienteId) { res.status(403).json({ error: 'No tienes permiso para esta cita' }); return; }
  if (cita.estado !== 'pendiente') { res.status(400).json({ error: 'Solo se puede reenviar para citas pendientes' }); return; }

  let emailDestino = '';
  const paciente = await prisma.user.findUnique({ where: { id: pacienteId } });
  if (!paciente) { res.status(404).json({ error: 'Paciente no encontrado' }); return; }

  if (nuevoEmail && nuevoEmail !== paciente.email) {
    const existe = await prisma.user.findFirst({ where: { email: nuevoEmail, id: { not: pacienteId } } });
    if (existe) { res.status(400).json({ error: 'El nuevo email ya está registrado' }); return; }
    await prisma.user.update({
      where: { id: pacienteId },
      data: { email: nuevoEmail },
    });
    emailDestino = nuevoEmail;
  } else {
    emailDestino = paciente.email;
  }

  const evento = await enviarConfirmacion({
    id: cita.id,
    especialidad: cita.especialidad,
    fecha: cita.fecha,
    hora: cita.hora,
    precioBase: cita.precioBase,
    precio: cita.precio,
    descuentoAplicado: cita.descuentoAplicado,
  } as any, emailDestino);

  res.json({ cita, notificacion: evento, emailEnviado: emailDestino });
}
