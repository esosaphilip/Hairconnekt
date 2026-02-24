const http = require('http');

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test_provider@example.com', password: 'password123' })
  }).catch(e => { console.log("Fetch failed", e); return null; });

  if (!loginRes) {
    console.log("No response from login. Is the server running?");
    return;
  }
  
  const text = await loginRes.text();
  console.log("Login res:", loginRes.status, text.slice(0, 50));
  
  try {
    const json = JSON.parse(text);
    if (!json.access_token) return;
    
    const headers = {
      'Authorization': 'Bearer ' + json.access_token,
      'Content-Type': 'application/json'
    };
    
    // Test update availability
    const availRes = await fetch('http://localhost:3000/api/v1/providers/me/availability', {
      method: 'PUT',
      headers,
      body: JSON.stringify({ slots: [{weekday: "monday", start: "09:00", end: "17:00"}] })
    });
    console.log("Availability res:", availRes.status, await availRes.text());
    
    // Test appointments
    const aptRes = await fetch('http://localhost:3000/api/v1/appointments/provider-create', {
      method: 'POST',
      headers,
      body: JSON.stringify({ serviceIds: [], startTime: "2024-10-10T10:00:00.000Z", endTime: "2024-10-10T11:00:00.000Z" })
    });
    console.log("Appointment res:", aptRes.status, await aptRes.text());

    // Test blocks
    const blkRes = await fetch('http://localhost:3000/api/v1/providers/me/calendar/blocks', {
      method: 'POST',
      headers,
      body: JSON.stringify({ startDate: "2024-10-10", reason: "vacation" })
    });
    console.log("Block res:", blkRes.status, await blkRes.text());
  } catch(e) { console.log(e); }
}

test();
