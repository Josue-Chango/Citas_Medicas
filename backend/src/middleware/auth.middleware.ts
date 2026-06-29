import { Request, Response, NextFunction } from 'express';
import prisma from '../data/database';

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }
  try {
    const token = header.split(' ')[1];
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId] = decoded.split(':');
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
    (req as any).userId = userId;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}
