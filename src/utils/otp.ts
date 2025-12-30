export type OTPRecord = {
  code: string;
  expiresAt: Date;
  attempts: number;
  verified?: boolean;
  payload?: any;
  type?: "register" | "forgot-password";
};

export const otpStore = new Map<string, OTPRecord>();

export const genOTP = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();
