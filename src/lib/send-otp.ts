import transporter from "../config/email.config";
import { otpEmailTemplate } from "../utils/otp-email-template";

export const sendOTPEmail = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject: "Your OTP Code",
    html: otpEmailTemplate(otp),
  };

  await transporter.sendMail(mailOptions);
};
