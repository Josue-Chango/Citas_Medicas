import prisma from '../data/database';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

function generarToken(userId: string, email: string): string {
  return Buffer.from(`${userId}:${email}:${Date.now()}`).toString('base64');
}

export async function login(data: LoginRequest): Promise<AuthResponse | null> {
  const user = await prisma.user.findFirst({
    where: { email: data.email, password: data.password },
  });
  if (!user) return null;
  if (user.penalizado) return null;
  const { password, ...userSinPassword } = user;
  return { token: generarToken(user.id, user.email), user: userSinPassword };
}

export async function register(data: RegisterRequest): Promise<AuthResponse | { error: string }> {
  const existe = await prisma.user.findFirst({ where: { email: data.email } });
  if (existe) return { error: 'El email ya está registrado' };

  const user = await prisma.user.create({
    data: {
      id: `USR-${Date.now()}`,
      nombre: data.nombre,
      email: data.email,
      password: data.password,
      tieneSeguro: data.tieneSeguro,
      penalizado: false,
    },
  });

  const { password, ...userSinPassword } = user;
  return { token: generarToken(user.id, user.email), user: userSinPassword };
}
