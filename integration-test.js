const axios = require('axios');

const baseUrl = 'http://localhost:5000/api';

async function test() {
  try {
    console.log('--- Integration Test Started ---');
    // 1. Login as Admin
    const loginRes = await axios.post(`${baseUrl}/login`, { email: 'admin@example.com', password: 'admin123' });
    const token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    console.log('Login successful');

    // 2. Create Location
    const locRes = await axios.post(`${baseUrl}/locations`, { name: 'Houston', city: 'Houston', state: 'TX', country: 'USA' }, config);
    const locId = locRes.data.location_id;
    console.log('Location created:', locId);

    // 3. Create Department
    const deptRes = await axios.post(`${baseUrl}/departments`, { name: 'Support', location_id: locId }, config);
    const deptId = deptRes.data.department_id;
    console.log('Department created:', deptId);

    // 4. Create Engineer
    const engRes = await axios.post(`${baseUrl}/users`, { 
      name: 'Eng Houston', email: 'enghouston@example.com', password: 'password', role: 'ENGINEER', location_id: locId, department_id: deptId 
    }, config);
    console.log('Engineer created:', engRes.data.user_id);

    // 5. Create Store
    const storeRes = await axios.post(`${baseUrl}/stores`, { name: 'Houston Store', location_id: locId, department_id: deptId }, config);
    const storeId = storeRes.data.store_id;
    console.log('Store created:', storeId);

    // 6. Create Ticket (Auto-assign)
    const ticketRes = await axios.post(`${baseUrl}/tickets`, { store_id: storeId, title: 'Server Down' }, config);
    console.log('Ticket created and auto-assigned:', ticketRes.data);
    if (ticketRes.data.assigned_engineer_id) {
        console.log('Auto-assignment SUCCESS');
    } else {
        console.log('Auto-assignment FAILED');
        process.exit(1);
    }

    // 7. Export Users
    const exportRes = await axios.get(`${baseUrl}/users/export`, config);
    console.log('Export check status:', exportRes.status);

    console.log('--- Integration Test Completed Successfully ---');
    process.exit(0);
  } catch (e) {
    console.error('Integration Test Failed:', e.response ? e.response.data : e.message);
    process.exit(1);
  }
}

test();
