const axios = require('axios');
const BASE = 'http://localhost:3000/api/v1';
const ts = Date.now();
const email = 'testprov2_' + ts + '@test.com';
const pw = 'Password123!';

async function test(label, fn) {
    try {
        const result = await fn();
        console.log('  ✅', label, '->', JSON.stringify(result).substring(0, 120));
        return result;
    } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message ?? e?.response?.data ?? e?.message;
        console.log('  ❌', label, ':', status, JSON.stringify(msg).substring(0, 200));
        return null;
    }
}

async function run() {
    // Register + login
    await axios.post(BASE + '/auth/register', {
        email, password: pw, firstName: 'Test2', lastName: 'Provider2',
        phone: '+4912345679' + Math.floor(Math.random() * 9), userType: 'PROVIDER',
    });
    const loginRes = await axios.post(BASE + '/auth/login', { emailOrPhone: email, password: pw, userType: 'PROVIDER' });
    const token = loginRes.data?.tokens?.accessToken;
    if (!token) { console.log('No token!'); process.exit(1); }

    const h = axios.create({ baseURL: BASE, headers: { Authorization: 'Bearer ' + token } });
    console.log('✅ Auth OK\n');

    // Create a service first (needed for appointment)
    let serviceId = null;
    const cats = await axios.get(BASE + '/services/categories');
    const catId = (cats.data?.data?.[0] ?? cats.data?.[0])?.id;
    console.log('Category ID:', catId);

    await test('POST /providers/me/services (create test service)', async () => {
        const r = await h.post('/providers/me/services', {
            name: 'Test Haircut',
            categoryId: catId,
            durationMinutes: 60,
            priceCents: 5000,
            isActive: true,
        });
        serviceId = r.data?.id ?? r.data?.data?.id;
        return { id: serviceId };
    });

    console.log('Service ID:', serviceId);

    // Test POST /appointments/provider-create
    const apptDate = new Date();
    apptDate.setDate(apptDate.getDate() + 1); // tomorrow
    const yyyy = apptDate.getFullYear();
    const mm = String(apptDate.getMonth() + 1).padStart(2, '0');
    const dd = String(apptDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    const startIso = `${dateStr}T10:00:00.000Z`;
    const endIso = `${dateStr}T11:00:00.000Z`;

    await test('POST /appointments/provider-create [Termin erstellen - with serviceIds]', async () => {
        const r = await h.post('/appointments/provider-create', {
            newClient: { name: 'Test Kunde', phone: '+491234567800' },
            serviceIds: serviceId ? [serviceId] : [],
            startTime: startIso,
            endTime: endIso,
            date: dateStr,
            location: 'salon',
            notes: 'Test appointment',
        });
        return r.data;
    });

    // Try with services array (alternative payload)
    await test('POST /appointments/provider-create [alt: services array]', async () => {
        const r = await h.post('/appointments/provider-create', {
            newClient: { name: 'Test Kunde 2', phone: '+491234567801' },
            services: serviceId ? [{ id: serviceId }] : [],
            startTime: startIso,
            endTime: endIso,
            date: dateStr,
        });
        return r.data;
    });

    // Try minimal payload
    await test('POST /appointments/provider-create [minimal payload]', async () => {
        const r = await h.post('/appointments/provider-create', {
            startTime: startIso,
            endTime: endIso,
        });
        return r.data;
    });

    console.log('\n=== Done ===');
}

run().catch(e => { console.error('Script error:', e.message); process.exit(1); });
