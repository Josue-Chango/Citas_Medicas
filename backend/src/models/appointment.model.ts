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
  precio: number;
}

const PRECIOS_BASE: Record<string, number> = {
  Cardiología: 150,
  Dermatología: 100,
  Pediatría: 80,
};

const DESCUENTO_SEGURO = 0.2;

export function calcularPrecio(especialidad: string, tieneSeguro: boolean): { precioBase: number; precio: number } {
  const precioBase = PRECIOS_BASE[especialidad] || 100;
  const precio = tieneSeguro ? Math.round(precioBase * (1 - DESCUENTO_SEGURO) * 100) / 100 : precioBase;
  return { precioBase, precio };
}
