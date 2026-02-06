import nodemailer from 'nodemailer'

/**
 * Email Utility
 * Sends emails via SMTP (configurable via environment variables)
 * 
 * Required environment variables:
 *   SMTP_HOST - SMTP server hostname (e.g., smtp.gmail.com)
 *   SMTP_PORT - SMTP server port (e.g., 587)
 *   SMTP_USER - SMTP username/email
 *   SMTP_PASS - SMTP password or app password
 *   SMTP_FROM - Sender email address (e.g., "RoyalT Customz <noreply@royaltcustomz.com>")
 */

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error(
      'Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.'
    )
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })
}

/**
 * Send a password reset email with a reset link
 */
export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getTransporter()
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@royaltcustomz.com'
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://royaltcustomz.com'
    const resetLink = `${baseUrl.replace(/\/$/, '')}/reset-password?code=${resetToken}`

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #111827; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #1f2937; border-radius: 16px; border: 1px solid #374151; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed, #4f46e5); padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">
                RoyalT Customz
              </h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: #ffffff; margin: 0 0 16px; font-size: 22px; font-weight: 600;">
                Password Reset Request
              </h2>
              <p style="color: #9ca3af; margin: 0 0 24px; font-size: 16px; line-height: 1.6;">
                Hello <strong style="color: #ffffff;">${username}</strong>,
              </p>
              <p style="color: #9ca3af; margin: 0 0 32px; font-size: 16px; line-height: 1.6;">
                We received a request to reset the password for your RoyalT Customz account.
                Click the button below to set a new password.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 32px;">
                <tr>
                  <td style="border-radius: 8px; background-color: #7c3aed;">
                    <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                      Reset Your Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; margin: 0 0 16px; font-size: 14px; line-height: 1.6;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="color: #7c3aed; margin: 0 0 32px; font-size: 14px; word-break: break-all;">
                <a href="${resetLink}" style="color: #7c3aed;">${resetLink}</a>
              </p>
              
              <!-- Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #292524; border: 1px solid #44403c; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <p style="color: #fbbf24; margin: 0 0 8px; font-size: 14px; font-weight: 600;">
                      Important:
                    </p>
                    <ul style="color: #9ca3af; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                      <li>This link expires in <strong style="color: #ffffff;">1 hour</strong></li>
                      <li>If you didn't request this, you can safely ignore this email</li>
                      <li>Never share this link with anyone</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #374151; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                &copy; ${new Date().getFullYear()} RoyalT Customz. All rights reserved.
              </p>
              <p style="color: #4b5563; margin: 8px 0 0; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

    const text = `Password Reset Request

Hello ${username},

We received a request to reset the password for your RoyalT Customz account.

Click this link to reset your password:
${resetLink}

Important:
- This link expires in 1 hour
- If you didn't request this, you can safely ignore this email
- Never share this link with anyone

-- RoyalT Customz`

    await transporter.sendMail({
      from,
      to,
      subject: 'Reset Your Password - RoyalT Customz',
      text,
      html,
    })

    console.log(`Password reset email sent to ${to} for user ${username}`)
    return { success: true }
  } catch (error: any) {
    console.error('Error sending password reset email:', error?.message || error)
    return { success: false, error: error?.message || 'Failed to send email' }
  }
}
