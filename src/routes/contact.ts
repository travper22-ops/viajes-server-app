// ============================================
// RUTA DE CONTACTO
// POST /api/v1/contact
// ============================================

import { Router, Request, Response } from 'express';
import { sendEmail } from '../services/email.js';

const router = Router();

interface ContactBody {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body as ContactBody;

    if (!name || !email || !message) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'Nombre, email y mensaje son obligatorios' }
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_EMAIL', message: 'Email inválido' }
      });
      return;
    }

    const adminEmail = process.env.SMTP_USER || process.env.EMAIL_FROM || '';
    const fromName   = process.env.EMAIL_FROM_NAME || 'Viajes y Experiencias';

    // Send notification to admin
    try {
      await sendEmail({
        to: adminEmail,
        subject: `[Contacto] ${subject || 'Nuevo mensaje de ' + name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #003580; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">Nuevo mensaje de contacto</h2>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Nombre:</td><td style="padding: 8px 0;">${name}</td></tr>
                <tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                ${phone ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Teléfono:</td><td style="padding: 8px 0;">${phone}</td></tr>` : ''}
                ${subject ? `<tr><td style="padding: 8px 0; font-weight: bold; color: #555;">Asunto:</td><td style="padding: 8px 0;">${subject}</td></tr>` : ''}
              </table>
              <div style="margin-top: 16px; padding: 16px; background: white; border-left: 4px solid #003580; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap; color: #333;">${message}</p>
              </div>
              <p style="margin-top: 16px; font-size: 12px; color: #888;">
                Enviado el ${new Date().toLocaleString('es-ES')} desde el formulario de contacto.
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('⚠️ No se pudo enviar email de contacto:', emailErr);
      // Don't fail the request — just log it
    }

    // Send confirmation to user
    try {
      await sendEmail({
        to: email,
        subject: `Hemos recibido tu mensaje — ${fromName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #003580; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">${fromName}</h2>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #e5e5e5; border-radius: 0 0 8px 8px;">
              <p>Hola <strong>${name}</strong>,</p>
              <p>Hemos recibido tu mensaje y nos pondremos en contacto contigo en breve.</p>
              <div style="margin: 16px 0; padding: 16px; background: white; border-left: 4px solid #003580; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap; color: #555; font-size: 14px;">${message}</p>
              </div>
              <p>Nuestro horario de atención es <strong>Lunes a Viernes de 07:30 a 23:59</strong>.</p>
              <p style="color: #888; font-size: 13px; margin-top: 24px;">
                Un saludo,<br/>El equipo de ${fromName}
              </p>
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      console.warn('⚠️ No se pudo enviar email de confirmación al usuario:', emailErr);
    }

    res.json({
      success: true,
      message: 'Mensaje recibido. Te contestaremos en breve.'
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error en /contact:', msg);
    res.status(500).json({
      success: false,
      error: { code: 'CONTACT_ERROR', message: msg }
    });
  }
});

export default router;
