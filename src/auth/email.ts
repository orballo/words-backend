import Mailgun from 'mailgun.js'
import formData from 'form-data'

const mailgun = new Mailgun(formData as any)
const email = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_KEY,
  public_key: process.env.MAILGUN_PUBLIC_KEY,
  url: process.env.MAILGUN_URL,
})

export default async (code: string, recipient: string) => {
  await email.messages.create('orballo.dev', {
    from: 'Words by Orballo <words@orballo.dev>',
    to: recipient,
    subject: 'Verification code for Words by Orballo',
    text: `Here is your verification code for Words by Orballo: ${code}`,
  })
}
