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
