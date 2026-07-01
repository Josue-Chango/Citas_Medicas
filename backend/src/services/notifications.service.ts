import nodemailer from 'nodemailer';
import { Appointment } from '../models/appointment.model';
import { generarTokenConfirmacion, generarTokenCancelacion } from './appointments.service';

interface NotifResult {
  exito: boolean;
  destino: string;
  mensaje: string;
}

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

function baseHeader(color: string, title: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, ${color}); padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 1.4rem;">ESPEcitas</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0;">Sistema de Gesti\u00f3n de Citas M\u00e9dicas</p>
      </div>
      <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">`;
}

function baseFooter(): string {
  return `
        <p style="color: #999; font-size: 0.8rem; border-top: 1px solid #e0e0e0; padding-top: 12px;">ESPEcitas &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>`;
}

function citaTable(cita: Appointment): string {
  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Especialidad</td><td style="padding: 8px 12px; font-weight: 600;">${cita.especialidad}</td></tr>
      <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Fecha</td><td style="padding: 8px 12px; font-weight: 600;">${cita.fecha}</td></tr>
      <tr><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Hora</td><td style="padding: 8px 12px; font-weight: 600;">${cita.hora}</td></tr>
      <tr style="background: #f9f9f9;"><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Precio original</td><td style="padding: 8px 12px; font-weight: 600;">$${cita.precioBase.toFixed(2)}</td></tr>
      ${cita.descuentoAplicado ? '<tr><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Descuento seguro (20%)</td><td style="padding: 8px 12px; font-weight: 600; color: #e74c3c;">-$' + (cita.precioBase - cita.precio).toFixed(2) + '</td></tr>' : ''}
      <tr><td style="padding: 8px 12px; color: #777; font-size: 0.85rem;">Total</td><td style="padding: 8px 12px; font-weight: 600; ${cita.descuentoAplicado ? 'color: #2ecc71;' : ''}">$${cita.precio.toFixed(2)}</td></tr>
    </table>`;
}

function sendMail(to: string, subject: string, html: string): Promise<NotifResult> {
  return transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  }).then(() => ({
    exito: true,
    destino: to,
    mensaje: `Correo enviado a ${to}`,
  })).catch(() => ({
    exito: false,
    destino: to,
    mensaje: 'Error al enviar el correo',
  }));
}

export async function enviarConfirmacion(cita: Appointment, emailPaciente: string): Promise<NotifResult> {
  const token = generarTokenConfirmacion(cita.id);
  const linkConfirmacion = `${FRONTEND_URL}/confirmar?id=${cita.id}&token=${token}`;

  const html = `
    ${baseHeader('#2ecc71, #27ae60', 'Confirma tu cita')}
      <h2 style="color: #1a1a1a; font-size: 1.1rem;">Confirma tu cita</h2>
      <p style="color: #555;">Hola,</p>
      <p style="color: #555;">Has solicitado una cita m\u00e9dica con los siguientes detalles:</p>
      ${citaTable(cita)}
      <p style="color: #e67e22; font-weight: 600; font-size: 0.85rem;">⚠ Tienes 24 horas para confirmar esta cita. Despu\u00e9s de ese tiempo se cancelar\u00e1 autom\u00e1ticamente.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${linkConfirmacion}" style="display: inline-block; background: #2ecc71; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem;">Confirmar Cita</a>
      </div>
      <p style="color: #999; font-size: 0.8rem;">Si no solicitaste esta cita, ignora este correo.</p>
    ${baseFooter()}`;

  return sendMail(emailPaciente, 'Confirma tu cita - ESPEcitas', html);
}

export async function enviarSolicitudCancelacion(cita: Appointment, emailPaciente: string, tienePenalizacion?: boolean): Promise<NotifResult> {
  const token = generarTokenCancelacion(cita.id);
  const linkCancelacion = `${FRONTEND_URL}/cancelar?id=${cita.id}&token=${token}`;

  const alertaPenalizacion = tienePenalizacion
    ? `<div style="background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 0.85rem; text-align: center;">
        <strong>⚠ Aviso:</strong> Has superado las 24 horas desde la confirmaci\u00f3n. Al cancelar se te aplicar\u00e1 una <strong>penalizaci\u00f3n</strong> y no podr\u00e1s agendar nuevas citas hasta que sea resuelta.
      </div>`
    : '';

  const html = `
    ${baseHeader('#dc3545, #b02a37', 'Cancela tu cita')}
      <h2 style="color: #1a1a1a; font-size: 1.1rem;">Cancela tu cita</h2>
      <p style="color: #555;">Hola,</p>
      <p style="color: #555;">Has solicitado cancelar una cita m\u00e9dica con los siguientes detalles:</p>
      ${citaTable(cita)}
      ${alertaPenalizacion}
      <p style="color: #555;">Para cancelar tu cita, haz clic en el bot\u00f3n:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${linkCancelacion}" style="display: inline-block; background: #dc3545; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem;">Cancelar Cita</a>
      </div>
      <p style="color: #999; font-size: 0.8rem;">Si no solicitaste esta cancelaci\u00f3n, ignora este correo.</p>
    ${baseFooter()}`;

  return sendMail(emailPaciente, 'Confirma la cancelaci\u00f3n de tu cita - ESPEcitas', html);
}

export async function enviarNoConfirmacionAuto(cita: Appointment, emailPaciente: string): Promise<NotifResult> {
  const html = `
    ${baseHeader('#e67e22, #d35400', 'Cita cancelada por falta de confirmaci\u00f3n')}
      <h2 style="color: #1a1a1a; font-size: 1.1rem;">Cita cancelada autom\u00e1ticamente</h2>
      <p style="color: #555;">Hola,</p>
      <p style="color: #555;">No confirmaste tu cita dentro de las 24 horas posteriores a la solicitud, por lo que ha sido <strong>cancelada autom\u00e1ticamente</strong>.</p>
      ${citaTable(cita)}
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 0.85rem; text-align: center;">
        ⏰ La cita no fue confirmada a tiempo y ha sido cancelada. Si deseas agendar una nueva cita, ingresa al sistema.
      </div>
      <div style="text-align: center; margin: 16px 0;">
        <a href="${FRONTEND_URL}/agendar" style="display: inline-block; background: #2ecc71; color: #fff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 1rem;">Agendar nueva cita</a>
      </div>
    ${baseFooter()}`;

  return sendMail(emailPaciente, 'Cita cancelada por falta de confirmaci\u00f3n - ESPEcitas', html);
}

export async function enviarPenalizacion(cita: Appointment, emailPaciente: string): Promise<NotifResult> {
  const html = `
    ${baseHeader('#dc3545, #b02a37', 'Penalizaci\u00f3n aplicada')}
      <h2 style="color: #1a1a1a; font-size: 1.1rem;">Se te ha aplicado una penalizaci\u00f3n</h2>
      <p style="color: #555;">Hola,</p>
      <p style="color: #555;">Has cancelado tu cita fuera del plazo de 24 horas desde la confirmaci\u00f3n. Por este motivo, se te ha <strong>aplicado una penalizaci\u00f3n</strong> y no podr\u00e1s agendar nuevas citas hasta que sea resuelta.</p>
      ${citaTable(cita)}
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; padding: 12px; border-radius: 8px; margin: 16px 0; font-size: 0.85rem; text-align: center;">
        <strong>🚫 Cuenta penalizada:</strong> No puedes agendar nuevas citas. Comun\u00edcate con la administraci\u00f3n para resolver esta situaci\u00f3n.
      </div>
    ${baseFooter()}`;

  return sendMail(emailPaciente, 'Penalizaci\u00f3n aplicada a tu cuenta - ESPEcitas', html);
}
