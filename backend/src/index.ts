import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import scheduleRoutes from './routes/schedule.routes';
import appointmentsRoutes from './routes/appointments.routes';
import { cancelarCitasVencidas } from './services/appointments.service';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/appointments', appointmentsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Sistema de Gestion de Citas Medicas' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  cancelarCitasVencidas();
  setInterval(cancelarCitasVencidas, 5 * 60 * 1000);
});
