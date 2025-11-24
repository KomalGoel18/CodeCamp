import nodemailer from "nodemailer";

export default async function sendResetEmail(to, resetUrl) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: `"CodeCamp" <${process.env.SMTP_USER}>`,
    to,
    subject: "Password reset",
    html: `<p>Click the link to reset your password:</p><a href="${resetUrl}">${resetUrl}</a>`
  });

  return info;
}