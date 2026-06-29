import prisma from '../data/database';

export async function obtenerEspecialidades(): Promise<string[]> {
  const doctores = await prisma.doctor.findMany();
  return [...new Set(doctores.map(d => d.especialidad))];
}

export async function obtenerMedicosPorEspecialidad(especialidad: string) {
  return prisma.doctor.findMany({ where: { especialidad } });
}

export async function obtenerHorariosDisponibles(medicoId: string, fecha: string) {
  const horas = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                 '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

  const ocupadas = await prisma.appointment.findMany({
    where: { medicoId, fecha, estado: { not: 'cancelada' } },
    select: { hora: true },
  });

  const horasOcupadas = new Set(ocupadas.map(o => o.hora));

  return horas.map(hora => ({
    id: `${medicoId}-${fecha}-${hora}`,
    medicoId,
    fecha,
    hora,
    estado: horasOcupadas.has(hora) ? 'ocupado' as const : 'disponible' as const,
  })).filter(s => s.estado === 'disponible');
}
