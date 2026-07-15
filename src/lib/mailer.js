import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_HOST) return null; // Email disabled – no SMTP configured.

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE) === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
  return transporter;
}

/**
 * Fire-and-forget email helper. Never throws — a failed alert must not break a
 * lead/teacher submission.
 */
export async function sendMail({ to, subject, html, text }) {
  try {
    const tx = getTransporter();
    if (!tx) {
      // eslint-disable-next-line no-console
      console.log(`[mail:disabled] ${subject} -> ${to}`);
      return false;
    }
    await tx.sendMail({
      from: process.env.MAIL_FROM || "London Academy <no-reply@example.com>",
      to,
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[mail:error]", err.message);
    return false;
  }
}

export function alertRecipient() {
  return process.env.ALERT_EMAIL || process.env.ADMIN_EMAIL;
}
