import { BrevoClient as Brevo } from "@getbrevo/brevo";

// Lazily creates the Brevo API client so dotenv has already loaded environment values.
const getBrevoClient = () => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error("BREVO_API_KEY is not configured");
    }

    return new Brevo({
        apiKey: process.env.BREVO_API_KEY,
        timeoutInSeconds: 15,
        maxRetries: 2
    });
};

// Escapes dynamic email content before rendering it into the HTML template.
const escapeHtml = (value) =>
    String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

// Responsive, production-friendly OTP email template for Sekura.
const buildOtpEmail = (otp) => {
    const safeOtp = escapeHtml(otp);

    return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sekura Verification Code</title>
</head>
<body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:28px 28px 18px;background:#0f172a;color:#ffffff;">
              <h1 style="margin:0;font-size:24px;line-height:1.25;font-weight:700;">Sekura verification</h1>
              <p style="margin:10px 0 0;color:#cbd5e1;font-size:15px;line-height:1.6;">Use this one-time code to finish signing in securely.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#374151;">Your secure login code is:</p>
              <div style="text-align:center;margin:26px 0;">
                <div style="display:inline-block;padding:18px 26px;border-radius:14px;background:#ecfeff;border:1px solid #67e8f9;color:#0e7490;font-size:36px;line-height:1;font-weight:800;letter-spacing:8px;">
                  ${safeOtp}
                </div>
              </div>
              <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#374151;"><strong>Expires in 5 minutes.</strong> Request a new code if this one expires.</p>
              <p style="margin:0;padding:14px 16px;border-radius:12px;background:#f9fafb;border:1px solid #e5e7eb;font-size:14px;line-height:1.6;color:#4b5563;">
                If you did not request this code, you can safely ignore this email. Never share this OTP with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px;background:#f9fafb;color:#6b7280;font-size:13px;line-height:1.5;text-align:center;">
              This message was sent by Sekura for account security.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Sends an OTP through the Brevo Transactional Email API.
export const sendOtpEmail = async ({ email, otp }) => {
    if (!process.env.EMAIL_FROM) {
        throw new Error("EMAIL_FROM is not configured");
    }

    const brevo = getBrevoClient();

    return brevo.transactionalEmails.sendTransacEmail({
        sender: {
            email: process.env.EMAIL_FROM,
            name: "Sekura"
        },
        to: [
            {
                email
            }
        ],
        subject: "Your Sekura verification code",
        htmlContent: buildOtpEmail(otp),
        textContent: `Your Sekura verification code is ${otp}. It expires in 5 minutes. Never share this code.`
    });
};
