import { createHmac } from 'crypto';
import prisma from '../data/database';
import { CreateAppointmentRequest, calcularPrecio } from '../models/appointment.model';

const CONFIRM_SECRET = process.env.CONFIRM_SECRET || 'especitas-confirm-secret';

export function generarTokenConfirmacion(citaId: string): string {
  return createHmac('sha256', CONFIRM_SECRET).update(citaId).digest('hex');
}

export function generarTokenCancelacion(citaId: string): string {
  return createHmac('sha256', CONFIRM_SECRET + '-cancel').update(citaId).digest('hex');
}

export async function crearCita(pacienteId: string, data: CreateAppointmentRequest) {
  const paciente = await prisma.user.findUnique({ where: { id: pacienteId } });
  if (!paciente) return { error: 'Paciente no encontrado' };
  if (paciente.penalizado) return { error: 'El paciente tiene bloqueos administrativos' };

  const doctor = await prisma.doctor.findUnique({ where: { id: data.medicoId } });
  if (!doctor) return { error: 'Médico no encontrado' };

  const conflicto = await prisma.appointment.findFirst({
    where: { medicoId: data.medicoId, fecha: data.fecha, hora: data.hora, estado: { not: 'cancelada' } },
  });
  if (conflicto) return { error: 'El horario ya está ocupado' };

  const { precioBase, precio } = calcularPrecio(data.especialidad, paciente.tieneSeguro);

  const cita = await prisma.appointment.create({
    data: {
      id: `CITA-${Date.now()}`,
      pacienteId,
      medicoId: data.medicoId,
      especialidad: data.especialidad,
      fecha: data.fecha,
      hora: data.hora,
      estado: 'pendiente',
      descuentoAplicado: paciente.tieneSeguro,
      precioBase,
      precio,
    },
  });

  return cita;
}

export async function obtenerCitasPorPaciente(pacienteId: string) {
  await cancelarCitasVencidas();
  return prisma.appointment.findMany({
    where: { pacienteId },
    include: { medico: true },
    orderBy: [{ fecha: 'asc' }, { hora: 'asc' }],
  });
}

export async function solicitarCancelacion(pacienteId: string, citaId: string) {
  const cita = await prisma.appointment.findUnique({ where: { id: citaId } });
  if (!cita) return { error: 'Cita no encontrada' };
  if (cita.pacienteId !== pacienteId) return { error: 'No tienes permiso para cancelar esta cita' };
  if (cita.estado === 'cancelada') return { error: 'La cita ya fue cancelada' };

  const citaFecha = new Date(`${cita.fecha}T${cita.hora}`);
  const ahora = new Date();
  const diffMs = citaFecha.getTime() - ahora.getTime();
  const hours24 = 24 * 60 * 60 * 1000;

  if (diffMs < hours24) return { error: 'Tiempo limite superado. No puedes cancelar una cita con menos de 24 horas de anticipación.' };

  return cita;
}

export async function confirmarCancelacion(citaId: string, token: string) {
  const esperado = generarTokenCancelacion(citaId);
  if (token !== esperado) return { error: 'Token de cancelación inválido' };

  const cita = await prisma.appointment.findUnique({ where: { id: citaId } });
  if (!cita) return { error: 'Cita no encontrada' };
  if (cita.estado === 'cancelada') return { error: 'La cita ya fue cancelada' };

  return prisma.appointment.update({
    where: { id: citaId },
    data: { estado: 'cancelada' },
  });
}

export async function cancelarCitasVencidas() {
  const pendientes = await prisma.appointment.findMany({
    where: { estado: 'pendiente' },
  });

  const ahora = new Date();
  const vencidas = pendientes.filter(c => {
    const citaFecha = new Date(`${c.fecha}T${c.hora}`);
    return citaFecha < ahora;
  });

  for (const c of vencidas) {
    await prisma.appointment.update({
      where: { id: c.id },
      data: { estado: 'cancelada' },
    });
  }

  return { canceladas: vencidas.length };
}

export async function confirmarCita(citaId: string, token: string) {
  const esperado = generarTokenConfirmacion(citaId);
  if (token !== esperado) return { error: 'Token de confirmación inválido' };

  const cita = await prisma.appointment.findUnique({ where: { id: citaId } });
  if (!cita) return { error: 'Cita no encontrada' };
  if (cita.estado !== 'pendiente') return { error: `La cita ya está ${cita.estado}` };

  return prisma.appointment.update({
    where: { id: citaId },
    data: { estado: 'confirmada' },
  });
}
