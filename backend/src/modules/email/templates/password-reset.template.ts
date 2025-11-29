export function passwordResetTemplate({ name, url, token }: { name?: string; url: string; token: string }) {
  const salutation = name ? `Hi ${name},` : 'Hi,';
  return {
    subject: 'Reset your Hairconnekt password',
    html: `
      <h1>Password Reset</h1>
      <p>${salutation}</p>
      <p>We received a request to reset your password.</p>
      <p>You can reset your password using the link below:</p>
      <p><a href="${url}">Reset your password</a></p>
      <p>If you prefer, you can also use this token directly in the app:</p>
      <p style="font-size:20px;font-weight:bold;letter-spacing:1px;">${token}</p>
      <p>This token expires in 10 minutes. If you did not request a password reset, you can ignore this email.</p>
    `,
  };
}