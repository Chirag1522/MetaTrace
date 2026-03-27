import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send password reset email
 * @param {string} email - Recipient's email
 * @param {string} resetLink - Full reset link with token
 * @returns {Promise<boolean>}
 */
export async function sendPasswordResetEmail(email, resetLink) {
  try {
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: email,
      subject: 'Reset your MetaTrace Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f74b25ff 0%, #ff6b35 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">MetaTrace</h1>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Password Reset Request</p>
          </div>
          
          <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #1c1c1c; margin-top: 0;">Hello,</h2>
            
            <p style="color: #5e5e5e; line-height: 1.6; font-size: 14px;">
              We received a request to reset your password. Click the button below to set a new password. This link will expire in 1 hour.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: linear-gradient(135deg, #f74b25ff 0%, #ff6b35 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 15px;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #5e5e5e; line-height: 1.6; font-size: 13px;">
              Or copy and paste this link in your browser:
            </p>
            <p style="background: #e5e5e5; padding: 10px; border-radius: 4px; word-break: break-all; color: #333; font-size: 12px;">
              ${resetLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px;">
              If you didn't request this, you can safely ignore this email. Your password won't change unless you click the link above.
            </p>
            
            <p style="color: #999; font-size: 12px; margin-bottom: 0;">
              © 2026 MetaTrace. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${email}:`, info.response);
    return true;
  } catch (error) {
    console.error(`❌ Error sending reset email to ${email}:`, error.message);
    return false;
  }
}

/**
 * Verify transporter configuration
 */
export async function verifyEmailConfiguration() {
  try {
    await transporter.verify();
    console.log('✅ Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
}
