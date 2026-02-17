const nodemailer = require("nodemailer");

// Configuración reutilizable del transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_APP_PASSWORD.replace(/\s+/g, '')
        }
    });
};

// --- FUNCIÓN 1: Enviar Código de Verificación (Registro) ---
const sendVerificationEmail = async (email, userName, userCode) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Hotel Bra´ul" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verifica tu cuenta",
        html: `<!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; }
            .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .code { font-size: 32px; font-weight: bold; color: #2c3e50; text-align: center; padding: 15px; background-color: #ecf0f1; border-radius: 5px; letter-spacing: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
                <h1>Bienvenido a Hotel Bra´ul</h1>
            </div>
            <div class="content">
              <h2>Hola, ${userName}</h2>
              <p>Gracias por registrarte. Para activar tu cuenta, utiliza el siguiente código:</p>
              
              <div class="code">${userCode}</div>
              
              <p><strong>Este código expira en 15 minutos.</strong></p>
            </div>
            <div class="footer">
              <p>© 2026 Hotel Management System.</p>
            </div>
          </div>
        </body>
      </html>`
    };

    try {
        console.log("📧 Enviando código a:", email);
        await transporter.sendMail(mailOptions);
        console.log("✅ Email enviado exitosamente");
    } catch (error) {
        console.error("❌ Error enviando verificación:", error);
        throw new Error("Error al enviar el email: " + error.message);
    }
};

// --- FUNCIÓN 2: Enviar Link de Recuperación (Forgot Password) ---
const sendResetPasswordEmail = async (email, userName, resetUrl) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Soporte Hotel" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Recuperación de Contraseña - Sistema Hotelero",
        html: `<!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; }
            .header { background-color: #d35400; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: white; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .btn-container { text-align: center; margin: 30px 0; }
            .btn { background-color: #d35400; color: white !important; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;}
            .btn:hover { background-color: #e67e22; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
                <h1>Recuperación de Contraseña</h1>
            </div>
            <div class="content">
              <h2>Hola, ${userName || 'Usuario'}</h2>
              <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:</p>
              
              <div class="btn-container">
                <a href="${resetUrl}" class="btn" target="_blank">Restablecer Contraseña</a>
              </div>
              
              <p style="font-size: 14px; color: #666;">O copia y pega este enlace en tu navegador:</p>
              <p style="font-size: 12px; word-break: break-all; color: #d35400;">${resetUrl}</p>
              
              <p><strong>Este enlace expira en 1 hora.</strong></p>
              <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
            <div class="footer">
              <p>© 2026 Hotel Management System.</p>
            </div>
          </div>
        </body>
      </html>`
    };

    try {
        console.log("📧 Enviando link de recuperación a:", email);
        await transporter.sendMail(mailOptions);
        console.log("✅ Email de recuperación enviado");
    } catch (error) {
        console.error("❌ Error enviando recuperación:", error);
        throw new Error("Error al enviar el email: " + error.message);
    }
};

module.exports = {
    sendVerificationEmail,
    sendResetPasswordEmail
};