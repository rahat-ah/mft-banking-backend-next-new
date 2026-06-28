import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.BREVO_EMAIL_SERVICE_SMTP_SERVER!,
  port: Number(process.env.BREVO_EMAIL_SERVICE_SMTP_PORT),
  secure: process.env.BREVO_EMAIL_SERVICE_SMTP_PORT === "465",
  auth: {
    user: process.env.BREVO_EMAIL_SERVICE_SMTP_USER!,
    pass: process.env.BREVO_EMAIL_SERVICE_SMTP_KEY!,
  },
});