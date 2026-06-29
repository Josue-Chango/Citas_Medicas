import axios from 'axios';
import type { AuthResponse, Doctor, ScheduleSlot, Appointment, User, CitaResponse } from '../types';

const api = axios.create({ baseURL: '/api' });

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
  setToken(data.token);
  return data;
}

export async function registerUser(nombre: string, email: string, password: string, tieneSeguro: boolean): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/auth/register', { nombre, email, password, tieneSeguro });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function getEspecialidades(): Promise<string[]> {
  const { data } = await api.get<string[]>('/schedule/especialidades');
  return data;
}

export async function getMedicos(especialidad: string): Promise<Doctor[]> {
  const { data } = await api.get<Doctor[]>(`/schedule/medicos/${especialidad}`);
  return data;
}

export async function getHorarios(medicoId: string, fecha: string): Promise<ScheduleSlot[]> {
  const { data } = await api.get<ScheduleSlot[]>('/schedule/horarios', {
    params: { medicoId, fecha },
  });
  return data;
}

export async function reservarCita(payload: {
  medicoId: string;
  especialidad: string;
  fecha: string;
  hora: string;
}): Promise<CitaResponse> {
  const { data } = await api.post<CitaResponse>('/appointments/reservar', payload);
  return data;
}

export async function getCitas(): Promise<Appointment[]> {
  const { data } = await api.get<Appointment[]>('/appointments');
  return data;
}

export async function cancelarCita(id: string): Promise<CitaResponse> {
  const { data } = await api.put<CitaResponse>(`/appointments/cancelar/${id}`);
  return data;
}

export async function confirmarCita(citaId: string, token: string): Promise<void> {
  await api.post('/appointments/confirmar', { citaId, token });
}

export async function confirmarCancelacion(citaId: string, token: string): Promise<void> {
  await api.post('/appointments/cancelar-confirmar', { citaId, token });
}
