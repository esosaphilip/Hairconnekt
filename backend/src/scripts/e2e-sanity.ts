import 'dotenv/config';
import axios from 'axios';

const API = process.env.API_URL || 'http://localhost:3000/api/v1';

async function main() {
  console.log('[E2E] Starting sanity flow against', API);

  const rnd = Math.floor(Math.random() * 100000);
  const clientEmail = `client${rnd}@example.com`;
  const providerEmail = `provider${rnd}@example.com`;
  const clientPhone = `+49176${1000000 + rnd}`;
  const providerPhone = `+49177${1000000 + rnd}`;

  // 1) Register client
  const clientReg = await axios.post(`${API}/auth/register`, {
    email: clientEmail,
    phone: clientPhone,
    firstName: 'Client',
    lastName: 'Test',
    userType: 'CLIENT',
    password: 'Passw0rd!'
  });
  const clientTokens = clientReg.data?.tokens;
  const clientId = clientReg.data?.user?.id;
  console.log('[E2E] Registered client', clientId, clientEmail);

  // 2) Register provider
  const providerReg = await axios.post(`${API}/auth/register`, {
    email: providerEmail,
    phone: providerPhone,
    firstName: 'Provider',
    lastName: 'Test',
    userType: 'PROVIDER',
    password: 'Passw0rd!'
  });
  const providerTokens = providerReg.data?.tokens;
  const providerUserId = providerReg.data?.user?.id;
  console.log('[E2E] Registered provider user', providerUserId, providerEmail);

  // 3) Seed provider profile for the provider user
  // Run the existing seed script via a child process for simplicity
  // Provider profile is auto-created during register for provider users

  // 4) Provider sets availability (Mon 10:00-11:00)
  const providerAuth = { headers: { Authorization: `Bearer ${providerTokens?.accessToken}` } };
  await axios.post(`${API}/providers/availability`, {
    slots: [
      { weekday: 'mon', start: '10:00', end: '11:00' },
    ],
  }, providerAuth);
  console.log('[E2E] Set provider availability');

  // 5) Provider creates a service
  const svc = await axios.post(`${API}/services`, {
    name: 'Test Haircut',
    description: 'Basic cut',
    durationMinutes: 60,
    priceCents: 5000,
    priceType: 'FIXED'
  }, providerAuth);
  const serviceId = svc.data?.id || svc.data?.service?.id || svc.data?.serviceId;
  console.log('[E2E] Created service', serviceId);

  // 6) Resolve provider profile id
  const providerProfile = await axios.get(`${API}/providers/me`, providerAuth);
  const providerId = providerProfile.data?.id;
  console.log('[E2E] Provider profile id', providerId);

  // 7) Client creates an appointment with the provider
  const clientAuth = { headers: { Authorization: `Bearer ${clientTokens?.accessToken}` } };
  const now = new Date();
  const start = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2h
  const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h
  const appt = await axios.post(`${API}/appointments`, {
    providerId,
    clientId: clientId, // controller will override to auth user, but include for DTO compliance
    serviceIds: [serviceId],
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    notes: 'Please be on time'
  }, clientAuth);
  const appointmentId = appt.data?.id;
  console.log('[E2E] Created appointment', appointmentId);

  // 8) Fetch client appointments
  const clientUpcoming = await axios.get(`${API}/appointments/client?status=upcoming`, clientAuth);
  console.log('[E2E] Client upcoming count', clientUpcoming.data?.count);

  // 9) Fetch provider dashboard
  const providerDashboard = await axios.get(`${API}/providers/dashboard`, providerAuth);
  console.log('[E2E] Provider dashboard stats', providerDashboard.data?.stats);

  console.log('[E2E] Sanity flow completed successfully');
}

main().catch((e) => {
  console.error('[E2E] Failure:', e?.response?.data || e);
  process.exit(1);
});
