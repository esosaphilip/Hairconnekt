const axios = require('axios');
(async () => {
  try {
    const email = `prov_${Date.now()}@test.com`;
    // Register unique provider
    console.log('Registering user...', email);
    const regRes = await axios.post('http://localhost:3000/api/v1/auth/register', {
      email,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'Provider',
      phone: '+49151' + Math.floor(1000000 + Math.random() * 9000000),
      userType: 'PROVIDER'
    });
    
    // Login to get token
    const loginRes = await axios.post('http://localhost:3000/api/v1/auth/login', {
      emailOrPhone: email,
      password: 'Password123!',
      userType: 'PROVIDER'
    });
    const token = loginRes.data.tokens.accessToken;
    
    // get categories
    const catsRes = await axios.get('http://localhost:3000/api/v1/services/categories');
    const categoryId = catsRes.data[0].id;

    console.log('Got categoryId:', categoryId);

    const serviceRes = await axios.post('http://localhost:3000/api/v1/providers/me/services', {
      name: 'Test Service',
      categoryId: categoryId,
      priceCents: 15000,
      durationMinutes: 90,
      description: 'A test service',
      isActive: true,
      allowOnlineBooking: true,
      requiresConsultation: false,
      tags: ['test']
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Service creation success:', serviceRes.data);
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
})();
