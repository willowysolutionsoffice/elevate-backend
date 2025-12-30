export const otpEmailTemplate = (otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Verify Your Email</title>
  <style>
    body {
      background-color: #f4f6f8;
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    .container {
      max-width: 480px;
      margin: auto;
      background: #ffffff;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    h1 {
      color: #111827;
      font-size: 22px;
      margin-bottom: 12px;
    }
    p {
      color: #4b5563;
      font-size: 14px;
      line-height: 1.5;
    }
    .otp {
      margin: 24px 0;
      text-align: center;
      font-size: 28px;
      letter-spacing: 6px;
      font-weight: bold;
      color: #2563eb;
    }
    .footer {
      margin-top: 24px;
      font-size: 12px;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Verification</h1>
    <p>
      Use the following One-Time Password (OTP) to complete your request.
      This OTP is valid for <strong>10 minutes</strong>.
    </p>

    <div class="otp">${otp}</div>

    <p>
      If you did not request this, please ignore this email.
    </p>

    <div class="footer">
      © ${new Date().getFullYear()} Your App Name. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
