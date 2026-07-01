import { Request, Response } from 'express';
import { login, register, actualizarPerfil, cambiarPassword } from '../services/auth.service';

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email y contraseña requeridos' });
    return;
  }
  const result = await login({ email, password });
  if (!result) {
    res.status(401).json({ error: 'Credenciales inválidas o usuario penalizado' });
    return;
  }
  res.json(result);
}

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const { nombre, email, password, tieneSeguro } = req.body;
  if (!nombre || !email || !password) {
    res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    return;
  }
  const result = await register({ nombre, email, password, tieneSeguro: !!tieneSeguro });
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.status(201).json(result);
}

export async function actualizarPerfilHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { nombre, email, tieneSeguro } = req.body;
  const result = await actualizarPerfil(userId, { nombre, email, tieneSeguro });
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result);
}

export async function cambiarPasswordHandler(req: Request, res: Response): Promise<void> {
  const userId = (req as any).userId;
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
    return;
  }
  const result = await cambiarPassword(userId, { currentPassword, newPassword });
  if ('error' in result) {
    res.status(400).json({ error: result.error });
    return;
  }
  res.json(result);
}
