export function bookingConfirmationTemplate({ bookingId, date }: { bookingId: string; date: string }) {
  return {
    subject: `Booking Confirmed #${bookingId}`,
    html: `<h1>Your booking is confirmed</h1><p>Booking ID: ${bookingId}</p><p>Date: ${date}</p>`,
  };
}