export interface User {
  id: string;
  nombre: string;
  email: string;
  tieneSeguro: boolean;
  penalizado: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
}

export interface ScheduleSlot {
  id: string;
  medicoId: string;
  fecha: string;
  hora: string;
  estado: 'disponible' | 'ocupado';
}

export interface Appointment {
  id: string;
  pacienteId: string;
  medicoId: string;
  medicoNombre: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  descuentoAplicado: boolean;
  precioBase: number;
  precio: number;
  createdAt: string;
}

export interface NotificationResult {
  exito: boolean;
  destino: string;
  mensaje: string;
}

export interface CitaResponse {
  cita: Appointment;
  notificacion: NotificationResult;
}
