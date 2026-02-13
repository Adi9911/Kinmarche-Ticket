import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      fetchTickets();
    }
  }, [navigate]);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    }
  };

  if (!user) return null;

  const ticketStats = {
    open: tickets.filter(t => t.status === 0).length,
    assigned: tickets.filter(t => t.status === 1).length,
    resolved: tickets.filter(t => t.status === 2).length,
    closed: tickets.filter(t => t.status === 3).length,
  };

  const priorityCounts = [1,2,3].map(p => tickets.filter(t => t.priority === p).length);

  const barData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      label: 'Tickets by Priority',
      data: priorityCounts,
      backgroundColor: ['#e63946', '#f4a261', '#2a9d8f']
    }]
  };

  const pieData = {
    labels: ['Open', 'Assigned', 'Resolved', 'Closed'],
    datasets: [
      {
        data: [ticketStats.open, ticketStats.assigned, ticketStats.resolved, ticketStats.closed],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
      },
    ],
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Kinmarche Ticketing System</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span>Welcome, {user.name} ({user.role})</span>
          <button onClick={() => { localStorage.clear(); navigate('/login'); }}>Logout</button>
        </div>
      </header>

      <main className="main-content">
        <div className="dashboard-grid">
          <div className="card">
            <h3>Navigation</h3>
            <nav>
              <ul className="nav-links" style={{ flexDirection: 'column', gap: '10px' }}>
                {user.role === 'ADMIN' && (
                  <>
                    <li><Link to="/locations" style={{ color: 'var(--primary-color)' }}>Manage Locations</Link></li>
                    <li><Link to="/departments" style={{ color: 'var(--primary-color)' }}>Manage Departments</Link></li>
                    <li><Link to="/users" style={{ color: 'var(--primary-color)' }}>Manage Users</Link></li>
                    <li><Link to="/stores" style={{ color: 'var(--primary-color)' }}>Manage Stores</Link></li>
                    <li><button onClick={async () => {
                      const res = await api.get('/users/export', { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'users.xlsx');
                      document.body.appendChild(link);
                      link.click();
                    }}>Export Users to Excel</button></li>
                  </>
                )}
                <li><Link to="/tickets" style={{ color: 'var(--primary-color)' }}>View Tickets</Link></li>
                {user.role === 'USER' && <li><Link to="/tickets/new" style={{ color: 'var(--primary-color)' }}>Raise New Ticket</Link></li>}
              </ul>
            </nav>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--primary-color)' }}>Ticket Status Distribution</h3>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 260 }}><Pie data={pieData} /></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{tickets.length}</div>
                <div style={{ color: '#666' }}>Total Tickets</div>
                <div style={{ marginTop: 12 }}>
                  <div><strong>Open:</strong> {ticketStats.open}</div>
                  <div><strong>Assigned:</strong> {ticketStats.assigned}</div>
                  <div><strong>Resolved:</strong> {ticketStats.resolved}</div>
                  <div><strong>Closed:</strong> {ticketStats.closed}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--primary-color)' }}>Priority Breakdown</h3>
            <div style={{ maxWidth: 400 }}>
              <Bar data={barData} options={{ plugins: { title: { display: false } } }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
