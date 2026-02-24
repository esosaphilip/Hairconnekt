const axios = require('axios');
const BASE = 'http://localhost:3000/api/v1';
const ts = Date.now();
const email = 'testprov_' + ts + '@test.com';
const pw = 'Password123!';

async function test(label, fn) {
    try {
        const result = await fn();
        console.log('  ✅', label, '->', JSON.stringify(result).substring(0, 100));
    } catch (e) {
        const status = e?.response?.status;
        const msg = e?.response?.data?.message ?? e?.response?.data ?? e?.message;
        console.log('  ❌', label, ':', status, JSON.stringify(msg).substring(0, 120));
    }
}

async function run() {
    console.log('\n=== Step 1: Register provider via /auth/register ===');
    let loginEmail = email;
    let loginPw = pw;

    try {
        const r = await axios.post(BASE + '/auth/register', {
            email,
            password: pw,
            firstName: 'Test',
            lastName: 'Provider',
            phone: '+4912345679' + Math.floor(Math.random() * 9),
            userType: 'PROVIDER',
        });
        console.log('REGISTER OK:', r.status, JSON.stringify(r.data).substring(0, 120));
    } catch (e) {
        console.log('REGISTER FAILED:', e?.response?.status, JSON.stringify(e?.response?.data));
        // Fall back to provider2@example.com with known password to still test endpoints
        loginEmail = 'provider2@example.com';
        loginPw = 'Password123!';
        console.log('Falling back to provider2@example.com...');
    }

    console.log('\n=== Step 2: Login ===');
    let token;
    try {
        const r = await axios.post(BASE + '/auth/login', {
            emailOrPhone: loginEmail,
            password: loginPw,
            userType: 'PROVIDER',
        });
        token = r.data?.tokens?.accessToken;
        if (!token) throw new Error('No token in response: ' + JSON.stringify(r.data));
        console.log('LOGIN OK - got token');
    } catch (e) {
        console.log('LOGIN FAILED:', e?.response?.status, JSON.stringify(e?.response?.data));
        console.log('\nTrying with auth/register account...');
        try {
            const r = await axios.post(BASE + '/auth/login', {
                emailOrPhone: email,
                password: pw,
                userType: 'PROVIDER',
            });
            token = r.data?.tokens?.accessToken;
            if (token) console.log('LOGIN OK with new account');
        } catch (e2) {
            console.log('Second login also failed:', e2?.response?.data?.message);
            console.log('\nCannot proceed without valid credentials. Exiting.');
            process.exit(1);
        }
    }

    const h = axios.create({
        baseURL: BASE,
        headers: { Authorization: 'Bearer ' + token },
    });

    console.log('\n=== Step 3: Testing endpoints ===\n');

    // 1. GET /providers/me
    let meId = null;
    await test('GET /providers/me', async () => {
        const r = await h.get('/providers/me');
        meId = r.data?.id ?? r.data?.data?.id;
        return { id: meId, status: r.status };
    });

    // 2. GET /providers/public/:id (NEW alias - fixes Mein Profil)
    if (meId) {
        await test('GET /providers/public/:id [NEW ALIAS - Mein Profil fix]', async () => {
            const r = await h.get('/providers/public/' + meId);
            return { success: r.data?.success, hasData: !!r.data?.data };
        });
    }

    // 3. GET /providers/me/dashboard (should include recentReviews)
    await test('GET /providers/me/dashboard [Neueste Bewertungen]', async () => {
        const r = await h.get('/providers/me/dashboard');
        const d = r.data?.data ?? r.data;
        return { reviews: d?.recentReviews?.length ?? 0, todayAppts: d?.todayAppointments?.length ?? 0 };
    });

    // 4. GET /providers/me/calendar (Kalender)
    await test('GET /providers/me/calendar [Kalender]', async () => {
        const r = await h.get('/providers/me/calendar', {
            params: { startDate: '2026-02-01', endDate: '2026-02-28', view: 'month' },
        });
        const d = r.data?.data ?? r.data;
        return { appointments: d?.appointments?.length ?? 0 };
    });

    // 5. GET /providers/me/clients (Kunden)
    await test('GET /providers/me/clients [Fehler beim Laden der KUNDEN]', async () => {
        const r = await h.get('/providers/me/clients');
        const d = r.data?.data ?? r.data;
        return { items: d?.items?.length ?? typeof d };
    });

    // 6. GET /providers/me/availability (Verfügbarkeit)
    await test('GET /providers/me/availability [Verfügbarkeit]', async () => {
        const r = await h.get('/providers/me/availability');
        return { ok: true, hasData: !!r.data };
    });

    // 7. POST /providers/me/calendar/blocks (Blockzeit hinzufügen)
    await test('POST /providers/me/calendar/blocks [Blockzeit hinzufügen]', async () => {
        const r = await h.post('/providers/me/calendar/blocks', {
            reason: 'test vacation',
            startDate: '2026-03-01',
            allDay: true,
            repeat: false,
        });
        return { id: r.data?.id ?? r.data?.blockId ?? 'saved', status: r.status };
    });

    // 8. GET /services/categories (needed by Termin/Service creation)
    await test('GET /services/categories', async () => {
        const r = await axios.get(BASE + '/services/categories');
        const cats = r.data?.data ?? r.data;
        return { count: Array.isArray(cats) ? cats.length : typeof cats };
    });

    // 9. GET /providers/me/services (for appointment creation)
    await test('GET /providers/me/services', async () => {
        const r = await h.get('/providers/me/services');
        const d = r.data?.data ?? r.data;
        return { count: Array.isArray(d) ? d.length : typeof d };
    });

    console.log('\n=== Done ===\n');
}

run().catch(e => {
    console.error('Script error:', e.message);
    process.exit(1);
});
