const axios = require('axios');

async function run() {
  try {
    const payload = {
      password: 'Password123!',
      profile: {
        businessName: 'Test Salon',
        businessType: 'SALON',
        yearsOfExperience: 5,
        isMobileService: false,
        serviceRadiusKm: 10,
      },
      contact: {
        firstName: 'Test',
        lastName: 'Provider',
        email: `testprovider${Date.now()}@example.com`,
        phone: '+4915112345678',
      },
      address: {
        street: 'Musterstraße',
        houseNumber: '1',
        postalCode: '12345',
        city: 'Berlin',
        state: 'BE',
        showOnMap: true,
      },
      services: ['Box Braids', 'Cornrows'],
      languages: ['Deutsch', 'Englisch'],
      specializations: ['Kinderfreundlich'],
    };

    const res = await axios.post('http://localhost:3000/api/v1/providers', payload);
    console.log('Success:', res.data);
  } catch (e) {
    console.error('Error:', e.response?.data || e.message);
  }
}

run();
