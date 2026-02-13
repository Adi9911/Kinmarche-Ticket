const axios = require('axios');

const baseUrl = 'http://localhost:5000/api';

async function test() {
  try {
    // 1. Login
    const loginRes = await axios.post(`${baseUrl}/login`, { email: 'admin@example.com', password: 'admin123' });
    const token = loginRes.data.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // 2. Create Location
    const locRes = await axios.post(`${baseUrl}/locations`, { name: 'Austin' }, config);
    const locId = locRes.data.location_id;

    // 3. Create Department
    const deptRes = await axios.post(`${baseUrl}/departments`, { name: 'IT', location_id: locId }, config);
    const deptId = deptRes.data.department_id;

    // 4. Create Engineer User
    const engUserRes = await axios.post(`${baseUrl}/users`, { 
      name: 'Eng 1', email: 'eng1@example.com', password: 'password', role: 'ENGINEER', location_id: locId, department_id: deptId 
    }, config);
    const engUserId = engUserRes.data.user_id;

    // 5. Create Store
    const storeRes = await axios.post(`${baseUrl}/stores`, { name: 'Store 1', location_id: locId, department_id: deptId }, config);
    const storeId = storeRes.data.store_id;

    // 6. Create Ticket
    const ticketRes = await axios.post(`${baseUrl}/tickets`, { store_id: storeId, title: 'Network Down' }, config);
    console.log('Ticket created:', ticketRes.data);

    // 7. Verify Assignment
    const ticketsRes = await axios.get(`${baseUrl}/tickets`, config);
    console.log('Tickets:', ticketsRes.data);

  } catch (e) {
    console.error('Test failed:', e.response ? e.response.data : e.message);
  }
}

test();
