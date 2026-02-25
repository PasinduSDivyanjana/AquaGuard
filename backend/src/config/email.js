import nodemailer from "nodemailer";

export const sendRegistrationOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Verification Code</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              background-color: #f4f6f9;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.5;
          }
          .wrapper {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          }
          .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px 20px;
              text-align: center;
          }
          .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 600;
              letter-spacing: -0.5px;
          }
          .content {
              padding: 40px 30px;
              background-color: #ffffff;
          }
          .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
          }
          .otp-container {
              background: linear-gradient(145deg, #f8faff 0%, #f0f3fd 100%);
              border: 2px dashed #667eea;
              border-radius: 16px;
              padding: 30px;
              margin: 25px 0;
              text-align: center;
          }
          .otp-label {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #666;
              margin-bottom: 10px;
          }
          .otp-code {
              font-size: 48px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #333;
              font-family: 'Courier New', monospace;
              background: white;
              padding: 15px 20px;
              border-radius: 12px;
              display: inline-block;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              border: 1px solid #e0e7ff;
          }
          .expiry-badge {
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 12px 20px;
              border-radius: 50px;
              font-size: 16px;
              margin: 20px 0;
              display: inline-block;
          }
          .features {
              display: flex;
              justify-content: center;
              gap: 30px;
              margin: 30px 0;
              padding: 20px 0;
              border-top: 1px solid #eee;
              border-bottom: 1px solid #eee;
          }
          .feature-item {
              text-align: center;
              font-size: 13px;
              color: #666;
          }
          .feature-icon {
              font-size: 24px;
              margin-bottom: 8px;
          }
          .warning {
              background-color: #fff8f8;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #721c24;
          }
          .footer {
              background-color: #f8f9fa;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
          }
          .footer p {
              margin: 5px 0;
              color: #6c757d;
              font-size: 13px;
          }
          .company-details {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #dee2e6;
              font-size: 12px;
              color: #999;
          }
          .button {
              background-color: #667eea;
              color: white;
              padding: 12px 30px;
              border-radius: 25px;
              text-decoration: none;
              font-weight: 500;
              display: inline-block;
              margin: 15px 0;
          }
          .button:hover {
              background-color: #5a67d8;
          }
          @media only screen and (max-width: 480px) {
              .content {
                  padding: 25px 20px;
              }
              .otp-code {
                  font-size: 36px;
                  letter-spacing: 5px;
              }
              .features {
                  flex-direction: column;
                  gap: 15px;
              }
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="header">
              <h1>Verify Your Email</h1>
          </div>
          
          <div class="content">
              <div class="greeting">
                  Hello,
              </div>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                  Thank you for registering! To complete your registration, please use the following verification code:
              </p>
              
              <div class="otp-container">
                  <div class="otp-label">Verification Code</div>
                  <div class="otp-code">${otp}</div>
                  
                  <div class="expiry-badge">
                      ⏰ Expires in 5 minutes
                  </div>
              </div>
              
              <div class="features">
                  <div class="feature-item">
                      <div class="feature-icon">⚡</div>
                      <div>Quick & Easy</div>
                  </div>
                  <div class="feature-item">
                      <div class="feature-icon">🔒</div>
                      <div>Secure Verification</div>
                  </div>
                  <div class="feature-item">
                      <div class="feature-icon">⏱️</div>
                      <div>Time-sensitive</div>
                  </div>
              </div>
              
              <div class="warning">
                  <strong>⚠️ Important:</strong> Never share this code with anyone. Our team will never ask for your verification code.
              </div>
              
              <p style="color: #555; font-size: 14px; margin-top: 20px;">
                  If you didn't request this code, please ignore this email or contact support immediately.
              </p>
              
              <div style="text-align: center; margin: 30px 0 10px;">
                  <a href="#" class="button">Need Help?</a>
              </div>
          </div>
          
          <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
              <p>📍 123 Business Street, Suite 100, City, State 12345</p>
              <p>📧 support@yourcompany.com | 📞 +1 (555) 123-4567</p>
              
              <div class="company-details">
                  <p>This is an automated message, please do not reply to this email.</p>
                  <p>If you're having trouble, contact our support team.</p>
              </div>
          </div>
      </div>
  </body>
  </html>
    `;

  try {
    const info = await transporter.sendMail({
      from: `"Aqua Guard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Registration OTP Code - Action Required",
      html: htmlTemplate,
    });

    console.log("OTP email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

export const sendLoginOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlTemplate = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Login Verification Code</title>
      <style>
          body {
              margin: 0;
              padding: 0;
              background-color: #f4f6f9;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.5;
          }
          .wrapper {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          }
          .header {
              background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
              padding: 30px 20px;
              text-align: center;
          }
          .header h1 {
              color: white;
              margin: 0;
              font-size: 28px;
              font-weight: 600;
              letter-spacing: -0.5px;
          }
          .header p {
              color: rgba(255, 255, 255, 0.9);
              margin: 10px 0 0;
              font-size: 16px;
          }
          .content {
              padding: 40px 30px;
              background-color: #ffffff;
          }
          .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 20px;
              font-weight: 500;
          }
          .login-notice {
              background-color: #e8f4fd;
              border-radius: 12px;
              padding: 15px 20px;
              margin: 20px 0;
              border-left: 4px solid #48c6ef;
              color: #2c3e50;
          }
          .login-notice strong {
              color: #0284c7;
          }
          .otp-container {
              background: linear-gradient(145deg, #f8faff 0%, #f0f3fd 100%);
              border: 2px dashed #6f86d6;
              border-radius: 16px;
              padding: 30px;
              margin: 25px 0;
              text-align: center;
          }
          .otp-label {
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 2px;
              color: #666;
              margin-bottom: 10px;
          }
          .otp-code {
              font-size: 48px;
              font-weight: 700;
              letter-spacing: 8px;
              color: #1e293b;
              font-family: 'Courier New', monospace;
              background: white;
              padding: 15px 20px;
              border-radius: 12px;
              display: inline-block;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
              border: 1px solid #e0e7ff;
              margin: 10px 0;
          }
          .expiry-badge {
              background-color: #fff3cd;
              border: 1px solid #ffeeba;
              color: #856404;
              padding: 12px 20px;
              border-radius: 50px;
              font-size: 16px;
              margin: 20px 0;
              display: inline-block;
          }
          .device-info {
              background-color: #f8fafc;
              border-radius: 12px;
              padding: 20px;
              margin: 25px 0;
              border: 1px solid #e2e8f0;
          }
          .device-info-title {
              font-size: 16px;
              font-weight: 600;
              color: #334155;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
          }
          .device-info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
          }
          .device-info-item {
              font-size: 14px;
              color: #475569;
          }
          .device-info-item span {
              color: #64748b;
              font-size: 12px;
              display: block;
              margin-bottom: 4px;
          }
          .warning {
              background-color: #fff8f8;
              border-left: 4px solid #dc3545;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
              color: #721c24;
          }
          .button {
              background: linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%);
              color: white;
              padding: 12px 30px;
              border-radius: 25px;
              text-decoration: none;
              font-weight: 500;
              display: inline-block;
              margin: 15px 0;
              transition: opacity 0.2s;
          }
          .button:hover {
              opacity: 0.9;
          }
          .footer {
              background-color: #f8f9fa;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
          }
          .footer p {
              margin: 5px 0;
              color: #6c757d;
              font-size: 13px;
          }
          .company-details {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #dee2e6;
              font-size: 12px;
              color: #999;
          }
          .help-text {
              font-size: 14px;
              color: #64748b;
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px dashed #cbd5e1;
          }
          @media only screen and (max-width: 480px) {
              .content {
                  padding: 25px 20px;
              }
              .otp-code {
                  font-size: 36px;
                  letter-spacing: 5px;
              }
              .device-info-grid {
                  grid-template-columns: 1fr;
              }
          }
      </style>
  </head>
  <body>
      <div class="wrapper">
          <div class="header">
              <h1>Login Verification</h1>
              <p>Secure access to your account</p>
          </div>
          
          <div class="content">
              <div class="greeting">
                  Hello,
              </div>
              
              <p style="color: #555; font-size: 16px; margin-bottom: 15px;">
                  We received a request to log in to your account. Use the verification code below to complete your login:
              </p>
              
              <div class="login-notice">
                  <strong>📍 Login attempt detected</strong><br>
                  Someone (hopefully you) is trying to log in to your account. If this wasn't you, please secure your account immediately.
              </div>
              
              <div class="otp-container">
                  <div class="otp-label">Login Verification Code</div>
                  <div class="otp-code">${otp}</div>
                  
                  <div class="expiry-badge">
                      ⏰ Code expires in 5 minutes
                  </div>
              </div>
              
              <div class="device-info">
                  <div class="device-info-title">
                      <span>🖥️</span> Login Request Details
                  </div>
                  <div class="device-info-grid">
                      <div class="device-info-item">
                          <span>Date & Time</span>
                          ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
                      </div>
                      <div class="device-info-item">
                          <span>Device Type</span>
                          Detected from your browser
                      </div>
                      <div class="device-info-item">
                          <span>Location</span>
                          Based on IP address
                      </div>
                      <div class="device-info-item">
                          <span>Browser</span>
                          Web browser access
                      </div>
                  </div>
              </div>
              
              <div class="warning">
                  <strong>⚠️ Security Alert:</strong> Never share this code with anyone. Our team will never ask for your verification code.
              </div>
              
              <p style="color: #555; font-size: 14px; margin: 20px 0;">
                  This code is valid for 5 minutes. For security reasons, it can only be used once.
              </p>
              
              <div style="text-align: center; margin: 30px 0 10px;">
                  <a href="#" class="button">Report Suspicious Activity</a>
              </div>
              
              <div class="help-text">
                  <p style="margin: 5px 0;">Didn't request this login? <a href="#" style="color: #6f86d6; text-decoration: none;">Secure your account now</a></p>
                  <p style="margin: 5px 0;">Need help? Contact our support team</p>
              </div>
          </div>
          
          <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
              <p>📍 123 Business Street, Suite 100, City, State 12345</p>
              <p>📧 support@yourcompany.com | 📞 +1 (555) 123-4567</p>
              
              <div class="company-details">
                  <p>This is an automated security message. For your protection, please don't reply to this email.</p>
                  <p>If you didn't attempt to log in, someone may have your password. Change it immediately.</p>
              </div>
          </div>
      </div>
  </body>
  </html>
    `;

  try {
    const info = await transporter.sendMail({
      from: `"Aqua Guard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Login OTP Code - Action Required",
      html: htmlTemplate,
    });

    console.log("Login OTP email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending login OTP email:", error);
    throw new Error("Failed to send login OTP email");
  }
};
