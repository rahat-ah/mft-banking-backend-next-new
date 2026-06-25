import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.RESEND_EMAIL_SERVICE_SMTP_SERVER!,
  port: Number(process.env.RESEND_EMAIL_SERVICE_SMTP_PORT),
  secure: process.env.RESEND_EMAIL_SERVICE_SMTP_PORT === "465",
  auth: {
    user: process.env.RESEND_EMAIL_SERVICE_SMTP_USER!,
    pass: process.env.RESEND_EMAIL_SERVICE_API_KEY!,
  },
});