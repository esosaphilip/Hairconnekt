export function verificationCodeTemplate({ name, code }: { name?: string; code: string }) {
  const salutation = name ? `Hi ${name},` : 'Hi,';
  return {
    subject: 'Verify your email for Hairconnekt',
    html: `
      <h1>Email Verification</h1>
      <p>${salutation}</p>
      <p>Your verification code is:</p>
      <p style="font-size:24px;font-weight:bold;letter-spacing:3px;">${code}</p>
      <p>This code expires in 10 minutes. If you did not sign up, you can ignore this email.</p>
    `,
  };
}