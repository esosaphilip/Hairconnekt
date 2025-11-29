export function welcomeTemplate({ name }: { name: string }) {
  return {
    subject: `Welcome to Hairconnekt, ${name}!`,
    html: `<h1>Welcome, ${name}!</h1><p>We’re excited to have you. Start exploring providers and book your first appointment.</p>`,
  };
}