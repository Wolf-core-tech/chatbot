const nodemailer = require('nodemailer');

let transporter = null;
const emailOutboxLog = []; // In-memory log for live UI preview of sent emails

async function getTransporter() {
  if (transporter) return transporter;

  // Check env vars for custom SMTP, or fallback to Nodemailer Ethereal test account
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Using configured SMTP transporter for Nodemailer.');
  } else {
    // Generate an Ethereal test account automatically
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`Created Ethereal test email account: ${testAccount.user}`);
    } catch (err) {
      console.warn('Failed to create Ethereal account, falling back to JSON transport:', err.message);
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  return transporter;
}

/**
 * Send Friend Invitation Email to Unregistered Users
 */
async function sendFriendInvitationEmail({ senderName, senderEmail, receiverEmail, inviteCode }) {
  const registerUrl = `http://localhost:3000?invite=${inviteCode}&email=${encodeURIComponent(receiverEmail)}`;
  
  const mailOptions = {
    from: `"WhatsApp Web Invite" <no-reply@whatsapp-web-clone.com>`,
    to: receiverEmail,
    subject: `${senderName} invited you to chat on WhatsApp Web!`,
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0b141a; color: #e9edef; padding: 30px; border-radius: 12px; max-width: 550px; margin: 0 auto; border: 1px solid #222d34;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #00a884; font-size: 26px; margin: 0;">WhatsApp Web</h1>
          <p style="color: #8696a0; font-size: 14px;">Real-Time Messaging Platform</p>
        </div>
        
        <div style="background-color: #111b21; padding: 20px; border-radius: 8px; border-left: 4px solid #00a884; margin-bottom: 20px;">
          <p style="font-size: 16px; margin-top: 0;">Hi there!</p>
          <p style="font-size: 15px; color: #d1d7db;">
            <strong>${senderName}</strong> (${senderEmail}) wants to connect with you on WhatsApp Web!
          </p>
          <p style="font-size: 14px; color: #8696a0;">
            Since you don't have an account yet with <strong>${receiverEmail}</strong>, click the button below to join and automatically connect.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${registerUrl}" target="_blank" style="background-color: #00a884; color: #111b21; font-weight: bold; padding: 14px 28px; text-decoration: none; border-radius: 24px; font-size: 16px; display: inline-block;">
            Accept Invitation & Join
          </a>
        </div>

        <div style="text-align: center; font-size: 12px; color: #8696a0; border-top: 1px solid #222d34; padding-top: 15px;">
          Direct Link: <a href="${registerUrl}" style="color: #53bdeb;">${registerUrl}</a>
        </div>
      </div>
    `,
  };

  try {
    const activeTransporter = await getTransporter();
    const info = await activeTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info) || null;

    const emailRecord = {
      id: Date.now().toString(),
      senderName,
      senderEmail,
      receiverEmail,
      inviteCode,
      registerUrl,
      previewUrl,
      sentAt: new Date().toISOString(),
    };

    emailOutboxLog.unshift(emailRecord);
    if (emailOutboxLog.length > 50) emailOutboxLog.pop();

    console.log(`[EMAIL SENT] Invitation sent to ${receiverEmail}. Preview: ${previewUrl || registerUrl}`);
    return { success: true, previewUrl, registerUrl };
  } catch (err) {
    console.error('Error sending invitation email:', err);
    // Still record in log for easy UI testing even if SMTP fails
    const emailRecord = {
      id: Date.now().toString(),
      senderName,
      senderEmail,
      receiverEmail,
      inviteCode,
      registerUrl,
      previewUrl: null,
      error: err.message,
      sentAt: new Date().toISOString(),
    };
    emailOutboxLog.unshift(emailRecord);
    return { success: false, registerUrl, error: err.message };
  }
}

function getEmailOutboxLog() {
  return emailOutboxLog;
}

module.exports = {
  sendFriendInvitationEmail,
  getEmailOutboxLog,
};
