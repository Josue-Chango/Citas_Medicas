import prisma from '../data/database';
import { AuthResponse, LoginRequest, RegisterRequest, UpdateProfileRequest, ChangePasswordRequest, User } from '../models/user.model';

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

export async function actualizarPerfil(userId: string, data: UpdateProfileRequest): Promise<{ user: Omit<User, 'password'> } | { error: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'Usuario no encontrado' };

  if (data.email && data.email !== user.email) {
    const existe = await prisma.user.findFirst({ where: { email: data.email, id: { not: userId } } });
    if (existe) return { error: 'El email ya está registrado' };
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.nombre && { nombre: data.nombre }),
      ...(data.email && { email: data.email }),
      ...(data.tieneSeguro !== undefined && { tieneSeguro: data.tieneSeguro }),
    },
  });

  const { password, ...userSinPassword } = updated;
  return { user: userSinPassword };
}

export async function cambiarPassword(userId: string, data: ChangePasswordRequest): Promise<{ success: true } | { error: string }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { error: 'Usuario no encontrado' };
  if (user.password !== data.currentPassword) return { error: 'La contraseña actual no es correcta' };

  await prisma.user.update({
    where: { id: userId },
    data: { password: data.newPassword },
  });

  return { success: true };
}
