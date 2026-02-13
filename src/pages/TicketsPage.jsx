import React, { useEffect, useState } from 'react';
import api from '../api';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const res = await api.get('/tickets');
    setTickets(res.data);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Tickets</h2>
      <ul>
        {tickets.map(t => (
          <li key={t.ticket_id} style={{ marginBottom: 12, padding: 10, border: '1px solid #eee', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <a href={`/tickets/${t.ticket_id}`}><strong style={{ color: 'var(--primary-color)' }}>{t.ticket_number || `#${t.ticket_id}`}</strong></a>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{t.title}</div>
                <div style={{ color: '#666', fontSize: 13 }}>{t.description}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 6 }}>{new Date(t.created_at).toLocaleString()}</div>
                <div style={{ padding: '4px 8px', borderRadius: 12, background: '#f0f0f0' }}>{
                  t.status === 0 ? 'Open' : t.status === 1 ? 'Assigned' : t.status === 2 ? 'Resolved' : t.status === 3 ? 'Closed' : t.status
                }</div>
                <div style={{ marginTop: 6 }}>Engineer: {t.engineer_id || 'None'}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TicketsPage;
