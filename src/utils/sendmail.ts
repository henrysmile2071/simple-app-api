import sendgrid from '@sendgrid/mail';
import { generateToken as generateConfirmationToken } from './jwt.js';
sendgrid.setApiKey(process.env.SENDGRID_API_KEY!); 

// Send the confirmation email
export const sendConfirmationEmail = async (userEmail: string, userId: string): Promise<void> => {
  const token = generateConfirmationToken(userId);
  const confirmUrl = `${process.env.HOME_PAGE_URL}?token=${token}`;

  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_SENDER_MAIL!,
    subject: 'Confirm Your Email',
    text: `Click the following link to confirm your email: ${confirmUrl}`,
    html: `<strong>Click the following link to confirm your email:</strong> <a href="${confirmUrl}">Confirm Email</a>`,
  };

  try {
    await sendgrid.send(msg);
    console.log('Confirmation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
