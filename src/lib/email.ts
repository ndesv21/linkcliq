import "server-only"
import { APP_NAME } from "./env"

type Email = { to: string; subject: string; html: string; text: string }

export async function sendEmail(email: Email) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
      "user-agent": "linkcliq",
    },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, ...email }),
  })
  if (!res.ok) throw new Error(`Resend returned ${res.status}: ${await res.text()}`)
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)
}

export function resetPasswordEmail(user: { name: string; email: string }, url: string): Email {
  const name = user.name.split(" ")[0] || "there"
  const text = `Hi ${name},

Someone asked to reset the password for your ${APP_NAME} account. Open this link to choose a new one:

${url}

The link works for one hour. If you did not ask for this, you can ignore this email and your password stays the same.`

  const html = `<!doctype html>
<html><body style="margin:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0a0a0a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#ffffff;border-radius:14px;border:1px solid #e5e5e5">
<tr><td style="padding:32px 32px 8px;font-size:15px;font-weight:600">${APP_NAME}</td></tr>
<tr><td style="padding:8px 32px 0;font-size:20px;font-weight:600;line-height:1.3">Reset your password</td></tr>
<tr><td style="padding:12px 32px 0;font-size:14px;line-height:1.6;color:#525252">Hi ${escapeHtml(name)}, someone asked to reset the password for your ${APP_NAME} account. The link works for one hour.</td></tr>
<tr><td style="padding:24px 32px"><a href="${escapeHtml(url)}" style="display:inline-block;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:11px 18px;border-radius:8px">Choose a new password</a></td></tr>
<tr><td style="padding:0 32px 32px;font-size:12px;line-height:1.6;color:#737373">If you did not ask for this, ignore this email and your password stays the same.</td></tr>
</table></td></tr></table></body></html>`

  return { to: user.email, subject: `Reset your ${APP_NAME} password`, html, text }
}
