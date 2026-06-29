import nodemailer from 'nodemailer';
import { Appointment } from '../models/appointment.model';
import { generarTokenConfirmacion } from './appointments.service';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export async function enviarConfirmacion(cita: Appointment, emailPaciente: string): Promise<{ exito: boolean; destino: string; mensaje: string }> {
  const token = generarTokenConfirmacion(cita.id);
  const linkConfirmacion = `${FRONTEND_URL}/confirmar?id=${cita.id}&token=${token}`;

  const asunto = 'Confirma tu cita - ESPEcitas';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 1.4rem;">ESPEcitas</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">Sistema de Gesti\u00f3n de Citas M\u00e9dicas</p>
      </div>
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1a1a1a; font-size: 1.1rem;">Confirma tu cita</h2>
        <p style="color: #555;">Hola,</p>
        <p style="color: #555;">Has solicitado una cita m\u00e9dica con los siguientes detalles:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Especialidad</td><td style="padding: 8px 12px; font-weight: 600;">${cita.especialidad}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Fecha</td><td style="padding: 8px 12px; font-weight: 600;">${cita.fecha}</td></tr>
          <tr><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Hora</td><td style="padding: 8px 12px; font-weight: 600;">${cita.hora}</td></tr>
        </table>
        <p style="color: #555;">Para confirmar tu cita, haz clic en el bot\u00f3n:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${linkConfirmacion}" style="display: inline-block; background: #2ecc71; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem;">Confirmar Cita</a>
        </div>
        <p style="color: #999; font-size: 0.8rem;">Si no solicitaste esta cita, ignora este correo.</p>
        <p style="color: #999; font-size: 0.8rem; border-top: 1px solid #e0e0e0; padding-top: 12px;">ESPEcitas &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: emailPaciente,
      subject: asunto,
      html,
    });
    return { exito: true, destino: emailPaciente, mensaje: `Correo de confirmacion enviado a ${emailPaciente}` };
  } catch {
    return { exito: false, destino: emailPaciente, mensaje: 'Error al enviar el correo de confirmacion' };
  }
}

export async function enviarCancelacion(cita: Appointment, emailPaciente: string): Promise<{ exito: boolean; destino: string; mensaje: string }> {
  const asunto = 'Cita Cancelada - Sistema de Gestion de Citas Medicas';
  const html = `
    <h2>Cita Cancelada</h2>
    <p>Hola,</p>
    <p>Tu cita ha sido cancelada exitosamente:</p>
    <ul>
      <li><strong>Especialidad:</strong> ${cita.especialidad}</li>
      <li><strong>Fecha:</strong> ${cita.fecha}</li>
      <li><strong>Hora:</strong> ${cita.hora}</li>
      <li><strong>Cita ID:</strong> ${cita.id}</li>
    </ul>
    <p>Si deseas agendar una nueva cita, puedes hacerlo en nuestra plataforma.</p>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: emailPaciente,
      subject: asunto,
      html,
    });
    return { exito: true, destino: emailPaciente, mensaje: `Cancelacion notificada a ${emailPaciente}` };
  } catch {
    return { exito: false, destino: emailPaciente, mensaje: 'Error al enviar la notificacion de cancelacion' };
  }
}
