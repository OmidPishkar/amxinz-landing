import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "AMXINZ <noreply@amxinz.com>";

export const emailConfigured = () => Boolean(process.env.RESEND_API_KEY);

/** Never throws. Returns { ok: false } when email is not configured or Resend rejects the message. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Email is not configured." };

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    if (error) {
      console.error("Resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return { ok: false, error: "Could not send the email." };
  }
}

export function verificationEmail(link: string) {
  const subject = "Confirm your email for Amxinz";
  const text = [
    "Confirm your email address to finish setting up your Amxinz profile:",
    "",
    link,
    "",
    "This link expires in 1 hour. If you did not request it, you can ignore this email.",
  ].join("\n");
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;color:#37352f"><div style="max-width:480px;margin:0 auto"><p style="font-size:15px;font-weight:600;margin:0 0 16px">Amxinz</p><p style="font-size:14px;line-height:1.6;margin:0 0 16px">Confirm your email address to finish setting up your profile.</p><p style="margin:0 0 16px"><a href="${link}" style="display:inline-block;background:#37352f;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;padding:9px 16px;border-radius:6px">Confirm email</a></p><p style="font-size:12px;line-height:1.6;color:#787774;margin:0">This link expires in 1 hour. If you did not request it, you can ignore this email.</p></div></body></html>`;
  return { subject, html, text };
}
