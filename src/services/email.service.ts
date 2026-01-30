import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

// Email templates
interface EmailTemplate {
  subject: string
  html: string
  text: string
}

interface ReservationEmailData {
  userName: string
  userEmail: string
  resourceName: string
  startTime: Date
  endTime: Date
  purpose: string
  notes?: string | null
}

interface PasswordResetEmailData {
  userName: string
  userEmail: string
  resetToken: string
  resetUrl: string
}

interface WelcomeEmailData {
  userName: string
  userEmail: string
  loginUrl: string
}

interface BlockNotificationEmailData {
  userName: string
  userEmail: string
  resourceName: string
  startTime: Date
  endTime: Date
  reason?: string | null
  affectedReservations: Array<{
    startTime: Date
    endTime: Date
    purpose: string
  }>
}

// Format helpers
function formatDateTime(date: Date): string {
  return format(date, "EEEE d MMMM yyyy 'om' HH:mm", { locale: nl })
}

function formatDate(date: Date): string {
  return format(date, 'd MMMM yyyy', { locale: nl })
}

function formatTime(date: Date): string {
  return format(date, 'HH:mm', { locale: nl })
}

function getPurposeLabel(purpose: string): string {
  const labels: Record<string, string> = {
    TRAINING: 'Training',
    LESSON: 'Les',
    OTHER: 'Anders',
  }
  return labels[purpose] || purpose
}

// Email templates
function reservationConfirmationTemplate(data: ReservationEmailData): EmailTemplate {
  const subject = `Reservering bevestigd - ${data.resourceName}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; width: 120px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reservering Bevestigd</h1>
    </div>
    <div class="content">
      <p>Beste ${data.userName},</p>
      <p>Uw reservering is bevestigd. Hieronder vindt u de details:</p>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Locatie:</span>
          <span>${data.resourceName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Datum:</span>
          <span>${formatDate(data.startTime)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tijd:</span>
          <span>${formatTime(data.startTime)} - ${formatTime(data.endTime)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Doel:</span>
          <span>${getPurposeLabel(data.purpose)}</span>
        </div>
        ${data.notes ? `
        <div class="detail-row">
          <span class="detail-label">Opmerkingen:</span>
          <span>${data.notes}</span>
        </div>
        ` : ''}
      </div>

      <p>U kunt uw reserveringen beheren via uw persoonlijke agenda op onze website.</p>
    </div>
    <div class="footer">
      <p>Stichting Manege de Raam</p>
      <p>Dit is een automatisch gegenereerd bericht.</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Reservering Bevestigd

Beste ${data.userName},

Uw reservering is bevestigd. Hieronder vindt u de details:

Locatie: ${data.resourceName}
Datum: ${formatDate(data.startTime)}
Tijd: ${formatTime(data.startTime)} - ${formatTime(data.endTime)}
Doel: ${getPurposeLabel(data.purpose)}
${data.notes ? `Opmerkingen: ${data.notes}` : ''}

U kunt uw reserveringen beheren via uw persoonlijke agenda op onze website.

Met vriendelijke groet,
Stichting Manege de Raam
`

  return { subject, html, text }
}

function reservationCancellationTemplate(
  data: ReservationEmailData & { reason?: string }
): EmailTemplate {
  const subject = `Reservering geannuleerd - ${data.resourceName}`

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
    .detail-label { font-weight: bold; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reservering Geannuleerd</h1>
    </div>
    <div class="content">
      <p>Beste ${data.userName},</p>
      <p>Uw reservering is geannuleerd. Dit betrof:</p>

      <div class="details">
        <div class="detail-row">
          <span class="detail-label">Locatie:</span> ${data.resourceName}
        </div>
        <div class="detail-row">
          <span class="detail-label">Datum:</span> ${formatDate(data.startTime)}
        </div>
        <div class="detail-row">
          <span class="detail-label">Tijd:</span> ${formatTime(data.startTime)} - ${formatTime(data.endTime)}
        </div>
        ${data.reason ? `
        <div class="detail-row">
          <span class="detail-label">Reden:</span> ${data.reason}
        </div>
        ` : ''}
      </div>

      <p>Heeft u vragen? Neem dan contact met ons op.</p>
    </div>
    <div class="footer">
      <p>Stichting Manege de Raam</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Reservering Geannuleerd

Beste ${data.userName},

Uw reservering is geannuleerd. Dit betrof:

Locatie: ${data.resourceName}
Datum: ${formatDate(data.startTime)}
Tijd: ${formatTime(data.startTime)} - ${formatTime(data.endTime)}
${data.reason ? `Reden: ${data.reason}` : ''}

Heeft u vragen? Neem dan contact met ons op.

Met vriendelijke groet,
Stichting Manege de Raam
`

  return { subject, html, text }
}

function passwordResetTemplate(data: PasswordResetEmailData): EmailTemplate {
  const subject = 'Wachtwoord resetten - Stichting Manege de Raam'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .warning { background-color: #fef3c7; padding: 10px; border-radius: 6px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Wachtwoord Resetten</h1>
    </div>
    <div class="content">
      <p>Beste ${data.userName},</p>
      <p>U heeft een verzoek ingediend om uw wachtwoord te resetten. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>

      <p style="text-align: center;">
        <a href="${data.resetUrl}" class="button">Wachtwoord Resetten</a>
      </p>

      <p>Of kopieer en plak deze link in uw browser:</p>
      <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${data.resetUrl}</p>

      <div class="warning">
        <strong>Let op:</strong> Deze link is 1 uur geldig. Heeft u dit verzoek niet gedaan? Dan kunt u deze email negeren.
      </div>
    </div>
    <div class="footer">
      <p>Stichting Manege de Raam</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Wachtwoord Resetten

Beste ${data.userName},

U heeft een verzoek ingediend om uw wachtwoord te resetten.

Klik op de volgende link om een nieuw wachtwoord in te stellen:
${data.resetUrl}

Let op: Deze link is 1 uur geldig.

Heeft u dit verzoek niet gedaan? Dan kunt u deze email negeren.

Met vriendelijke groet,
Stichting Manege de Raam
`

  return { subject, html, text }
}

function welcomeTemplate(data: WelcomeEmailData): EmailTemplate {
  const subject = 'Welkom bij Stichting Manege de Raam'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .button { display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .features { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .feature { padding: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welkom!</h1>
    </div>
    <div class="content">
      <p>Beste ${data.userName},</p>
      <p>Welkom bij Stichting Manege de Raam! Uw account is succesvol aangemaakt.</p>

      <div class="features">
        <h3>Wat kunt u nu doen?</h3>
        <div class="feature">✓ Faciliteiten reserveren via de online agenda</div>
        <div class="feature">✓ Uw reserveringen beheren</div>
        <div class="feature">✓ Evenementen bekijken</div>
      </div>

      <p style="text-align: center;">
        <a href="${data.loginUrl}" class="button">Inloggen</a>
      </p>

      <p>Heeft u vragen? Neem gerust contact met ons op.</p>
    </div>
    <div class="footer">
      <p>Stichting Manege de Raam</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Welkom bij Stichting Manege de Raam!

Beste ${data.userName},

Welkom bij Stichting Manege de Raam! Uw account is succesvol aangemaakt.

Wat kunt u nu doen?
- Faciliteiten reserveren via de online agenda
- Uw reserveringen beheren
- Evenementen bekijken

Log in via: ${data.loginUrl}

Heeft u vragen? Neem gerust contact met ons op.

Met vriendelijke groet,
Stichting Manege de Raam
`

  return { subject, html, text }
}

function blockNotificationTemplate(data: BlockNotificationEmailData): EmailTemplate {
  const subject = `Blokkering - ${data.resourceName} niet beschikbaar`

  const affectedList = data.affectedReservations
    .map(
      (r) =>
        `- ${formatDate(r.startTime)} ${formatTime(r.startTime)} - ${formatTime(r.endTime)} (${getPurposeLabel(r.purpose)})`
    )
    .join('\n')

  const affectedListHtml = data.affectedReservations
    .map(
      (r) =>
        `<li>${formatDate(r.startTime)} ${formatTime(r.startTime)} - ${formatTime(r.endTime)} (${getPurposeLabel(r.purpose)})</li>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f97316; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #f9fafb; }
    .details { background-color: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .warning { background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Blokkering Melding</h1>
    </div>
    <div class="content">
      <p>Beste ${data.userName},</p>
      <p>Er is een blokkering aangemaakt die invloed heeft op uw reservering(en).</p>

      <div class="details">
        <h3>Blokkering Details</h3>
        <p><strong>Locatie:</strong> ${data.resourceName}</p>
        <p><strong>Van:</strong> ${formatDateTime(data.startTime)}</p>
        <p><strong>Tot:</strong> ${formatDateTime(data.endTime)}</p>
        ${data.reason ? `<p><strong>Reden:</strong> ${data.reason}</p>` : ''}
      </div>

      <div class="warning">
        <h3>Uw getroffen reservering(en)</h3>
        <ul>
          ${affectedListHtml}
        </ul>
        <p>Deze reserveringen zijn gemarkeerd als "beïnvloed door blokkering".</p>
      </div>

      <p>Neem contact met ons op als u vragen heeft.</p>
    </div>
    <div class="footer">
      <p>Stichting Manege de Raam</p>
    </div>
  </div>
</body>
</html>
`

  const text = `
Blokkering Melding

Beste ${data.userName},

Er is een blokkering aangemaakt die invloed heeft op uw reservering(en).

BLOKKERING DETAILS
Locatie: ${data.resourceName}
Van: ${formatDateTime(data.startTime)}
Tot: ${formatDateTime(data.endTime)}
${data.reason ? `Reden: ${data.reason}` : ''}

UW GETROFFEN RESERVERING(EN)
${affectedList}

Deze reserveringen zijn gemarkeerd als "beïnvloed door blokkering".

Neem contact met ons op als u vragen heeft.

Met vriendelijke groet,
Stichting Manege de Raam
`

  return { subject, html, text }
}

// Email sending functions
// In development, these log to console
// In production, they would use Resend or another email service

async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  const isDevelopment = process.env.NODE_ENV !== 'production'

  if (isDevelopment || !process.env.RESEND_API_KEY) {
    // Log to console in development
    console.log('\n' + '='.repeat(60))
    console.log('EMAIL NOTIFICATION (Development Mode)')
    console.log('='.repeat(60))
    console.log(`To: ${to}`)
    console.log(`Subject: ${template.subject}`)
    console.log('-'.repeat(60))
    console.log('PLAIN TEXT VERSION:')
    console.log(template.text)
    console.log('='.repeat(60) + '\n')
    return true
  }

  // Production email sending with Resend
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Stichting Manege de Raam <noreply@stichtingderaam.nl>',
      to: [to],
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    if (result.error) {
      console.error('Email send error:', result.error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Public email functions
export async function sendReservationConfirmation(data: ReservationEmailData): Promise<boolean> {
  const template = reservationConfirmationTemplate(data)
  return sendEmail(data.userEmail, template)
}

export async function sendReservationCancellation(
  data: ReservationEmailData & { reason?: string }
): Promise<boolean> {
  const template = reservationCancellationTemplate(data)
  return sendEmail(data.userEmail, template)
}

export async function sendPasswordReset(data: PasswordResetEmailData): Promise<boolean> {
  const template = passwordResetTemplate(data)
  return sendEmail(data.userEmail, template)
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
  const template = welcomeTemplate(data)
  return sendEmail(data.userEmail, template)
}

export async function sendBlockNotification(data: BlockNotificationEmailData): Promise<boolean> {
  const template = blockNotificationTemplate(data)
  return sendEmail(data.userEmail, template)
}
