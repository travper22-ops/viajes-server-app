// ============================================
// SERVICIO DE EMAIL
// ============================================

import nodemailer from 'nodemailer';
import env, { isEmailConfigured } from '../config/env.js';

// ============================================
// INTERFACES
// ============================================

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer;
    path?: string;
  }>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// ============================================
// TRANSPORTER
// ============================================

let transporter: any = null;

/**
 * Inicializa el servicio de email
 */
export function initEmailService(): any {
  if (!isEmailConfigured()) {
    console.log('⚠️  Email no configurado - usando modo desarrollo (Ethereal)');
    
    // Crear transporter de desarrollo
    nodemailer.createTestAccount().then((testAccount) => {
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('✅ Email de desarrollo configurado (Ethereal)');
      console.log('   Los emails se mostrarán en la consola durante desarrollo');
    });
    
    return null;
  }
  
  try {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
    
    console.log('✅ Email configurado correctamente');
    return transporter;
  } catch (error) {
    console.error('❌ Error al configurar email:', error);
    return null;
  }
}

/**
 * Obtiene el transporter actual
 */
export function getTransporter(): any {
  return transporter;
}

// ============================================
// FUNCIONES DE ENVÍO
// ============================================

/**
 * Envía un email
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResponse> {
  if (!transporter) {
    initEmailService();
  }
  
  if (!transporter) {
    return {
      success: false,
      error: 'Email no configurado'
    };
  }
  
  try {
    // Normalizar destinatarios
    const to = Array.isArray(options.to) ? options.to.join(', ') : options.to;
    
    const info = await transporter.sendMail({
      from: `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`,
      to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments
    });
    
    // En desarrollo, mostrar URL de previsualización
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email enviado:', info.messageId);
      console.log('   Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ Error al enviar email:', errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

// ============================================
// PLANTILLAS DE EMAIL
// ============================================

/**
 * Email de bienvenida
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: '¡Bienvenido a Travel Agency!',
    html: `
      <h1>¡Bienvenido, ${name}!</h1>
      <p>Gracias por registrarte en Travel Agency.</p>
      <p>Ahora puedes:</p>
      <ul>
        <li>Buscar vuelos y hoteles</li>
        <li>Realizar reservas</li>
        <li>Ver tu historial de viajes</li>
      </ul>
      <p>¡Disfruta de tu experiencia!</p>
    `
  });
}

/**
 * Email de confirmación de reserva
 */
export async function sendBookingConfirmation(
  email: string,
  bookingReference: string,
  bookingDetails: Record<string, unknown>
): Promise<EmailResponse> {
  return sendEmail({
    to: email,
    subject: `Confirmación de reserva - ${bookingReference}`,
    html: `
      <h1>¡Reserva confirmada!</h1>
      <p>Tu número de referencia es: <strong>${bookingReference}</strong></p>
      <h2>Detalles de la reserva:</h2>
      <pre>${JSON.stringify(bookingDetails, null, 2)}</pre>
      <p>Gracias por confiar en Travel Agency</p>
    `
  });
}

/**
 * Email de reset de password
 */
export async function sendPasswordReset(email: string, resetToken: string): Promise<EmailResponse> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  return sendEmail({
    to: email,
    subject: 'Recuperar contraseña - Travel Agency',
    html: `
      <h1>Recuperar contraseña</h1>
      <p>Has solicitado recuperar tu contraseña.</p>
      <p>Haz clic en el siguiente enlace:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none;">
        Recuperar contraseña
      </a>
      <p>El enlace expira en 1 hora.</p>
      <p>Si no solicitaste esto, ignora este email.</p>
    `
  });
}

/**
 * Email de contacto
 */
export async function sendContactEmail(
  fromEmail: string,
  name: string,
  message: string
): Promise<EmailResponse> {
  return sendEmail({
    to: env.EMAIL_FROM,
    subject: `Nuevo contacto de ${name}`,
    html: `
      <h1>Nuevo mensaje de contacto</h1>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${fromEmail}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${message}</p>
    `
  });
}

export default {
  initEmailService,
  getTransporter,
  sendEmail,
  sendWelcomeEmail,
  sendBookingConfirmation,
  sendPasswordReset,
  sendContactEmail
};
