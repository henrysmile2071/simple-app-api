import jwt from 'jsonwebtoken';
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || ''); 

// Generate the email confirmation token
const generateConfirmationToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '1d' });
};

// Send the confirmation email
export const sendConfirmationEmail = async (userEmail: string, userId: string): Promise<void> => {
  const token = generateConfirmationToken(userId);
  const confirmUrl = `${process.env.BASE_URL}/confirm-email/${token}`;

  const msg = {
    to: userEmail,
    from: process.env.SENDGRID_SENDER_MAIL || '',
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
