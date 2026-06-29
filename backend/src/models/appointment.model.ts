import { Appointment as PrismaAppointment } from '../generated/prisma/client';

export type Appointment = PrismaAppointment;

export type AppointmentWithDoctor = Appointment & { medicoNombre: string };

export interface CreateAppointmentRequest {
  medicoId: string;
  especialidad: string;
  fecha: string;
  hora: string;
}

export interface AppointmentSummary {
  medico: string;
  especialidad: string;
  fecha: string;
  hora: string;
}
