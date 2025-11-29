export function reminderTemplate({ appointmentId, when }: { appointmentId: string; when: string }) {
  return {
    subject: `Reminder for appointment #${appointmentId}`,
    html: `<h1>Appointment Reminder</h1><p>Your appointment (#${appointmentId}) is coming up ${when}.</p>`,
  };
}