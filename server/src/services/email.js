/**
 * Transactional email — configure SMTP in server/.env to enable sending.
 * Without SMTP, emails are logged to the server console (dev mode).
 */

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
}

export async function sendEmail({ to, subject, text, html }) {
  if (!to) return { ok: false, skipped: true, reason: 'No recipient' }

  if (!isEmailConfigured()) {
    console.log('[email] (SMTP not configured)', { to, subject, text })
    return { ok: false, skipped: true, reason: 'SMTP not configured' }
  }

  try {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.default.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    })

    return { ok: true }
  } catch (err) {
    console.error('[email] send failed:', err.message)
    return { ok: false, error: err.message }
  }
}

export async function sendPasswordResetEmail({ email, token }) {
  const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  const resetUrl = `${clientOrigin.split(',')[0].trim()}/#reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
  const subject = 'Reset your Sugar & Slate password'
  const text = [
    'You requested a password reset for your Sugar & Slate account.',
    '',
    `Use this link to set a new password: ${resetUrl}`,
    '',
    `Or enter this reset code on the reset page: ${token}`,
    '',
    'This link expires in 24 hours. If you did not request this, ignore this email.',
  ].join('\n')
  const html = `
    <p>You requested a password reset for your Sugar & Slate account.</p>
    <p><a href="${resetUrl}">Reset your password</a></p>
    <p>Or use this code on the reset page: <strong>${token}</strong></p>
    <p>This expires in 24 hours.</p>
  `
  return sendEmail({ to: email, subject, text, html })
}

export async function sendOrderConfirmationEmail({ email, name, orderId, total }) {
  const subject = `Order Confirmed — ${orderId} | Sugar & Slate`
  const text = [
    `Hi ${name || 'there'},`,
    '',
    `Thank you for your order at Sugar & Slate!`,
    '',
    `Order ID: ${orderId}`,
    `Total paid: ₹${Number(total || 0).toLocaleString('en-IN')}`,
    '',
    `We'll notify you as your order is prepared and dispatched.`,
    '',
    '— Sugar & Slate Patisserie',
  ].join('\n')

  const html = `
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for your order at <strong>Sugar & Slate</strong>!</p>
    <p><strong>Order ID:</strong> ${orderId}<br/>
    <strong>Total paid:</strong> ₹${Number(total || 0).toLocaleString('en-IN')}</p>
    <p>We'll notify you as your order is prepared and dispatched.</p>
    <p>— Sugar & Slate Patisserie</p>
  `

  return sendEmail({ to: email, subject, text, html })
}
