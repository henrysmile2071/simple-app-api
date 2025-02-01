import sendgrid from '@sendgrid/mail';
import { generateIdToken as generateConfirmationToken } from './jwt.js';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!);

// Send the confirmation email
export const sendConfirmationEmail = async (
  userEmail: string,
  userId: string
): Promise<void | Error> => {
  const token = generateConfirmationToken(userId);
  const confirmUrl = `${process.env.LOGIN_PAGE_URL}?token=${token}`;

  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_SENDER_MAIL!,
    subject: 'Confirm Your Email',
    text: `Click the following link to confirm your email: ${confirmUrl}`,
    html: `<strong>Click the following link to confirm your email:</strong> <a href="${confirmUrl}">Confirm Email</a>`,
  };

  try {
    const res = await sendgrid.send(msg);
    console.log('Sendgrid Response:', res);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
