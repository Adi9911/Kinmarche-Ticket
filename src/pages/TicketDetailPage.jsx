import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const TicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState(null);
  const [type, setType] = useState('worklog');
  const [file, setFile] = useState(null);
  const [closureCode, setClosureCode] = useState('');
  const [closureComments, setClosureComments] = useState('');

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      alert('Failed to fetch ticket: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => { fetchTicket(); }, [id]);

  const addWorklog = async (e) => {
    e.preventDefault();
    try {
      // if there's a file selected, upload it first
      let attachment_id = null;
      if (file) {
        const form = new FormData();
        form.append('file', file);
        const ares = await api.post(`/tickets/${id}/attachments`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
        attachment_id = ares.data.attachment_id;
        setFile(null);
      }

      await api.post(`/tickets/${id}/worklogs`, { comment, status, type, attachment_id });
      setComment(''); setStatus(null);
      fetchTicket();
    } catch (err) {
      alert('Failed to add worklog');
    }
  };

  const closeTicket = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tickets/${id}/close`, { closure_code: closureCode, closure_comments: closureComments });
      fetchTicket();
      navigate('/tickets');
    } catch (err) {
      alert('Failed to close ticket');
    }
  };

  if (!ticket) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Ticket {ticket.ticket_number || `#${ticket.ticket_id}`} - {ticket.title}</h2>
      <p><strong>Status:</strong> {ticket.status}</p>
      <p><strong>Requested By:</strong> {ticket.created_by}</p>
      <p><strong>Assigned To (engineer_id):</strong> {ticket.engineer_id || 'None'}</p>
      <p>{ticket.description}</p>

      <h3>Worklogs</h3>
      {ticket.worklogs && ticket.worklogs.length ? (
        <ul>
          {ticket.worklogs.map(w => (
            <li key={w.worklog_id} style={{ marginBottom: 8 }}>
              <div><strong>{new Date(w.created_at).toLocaleString()}</strong> - <em>{w.type}</em> {w.attachment_id ? '(has attachment)' : ''}</div>
              <div>{w.comment}</div>
              <div style={{ fontSize: 12, color: '#666' }}>Status: {w.status}</div>
            </li>
          ))}
        </ul>
      ) : <p>No worklogs yet.</p>}

      <form onSubmit={addWorklog} style={{ marginTop: 16 }}>
        <h4>Add Worklog / Resolution Comment</h4>
        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4} style={{ width: '100%' }} required />
        <div style={{ marginTop: 8 }}>
          <label>Type: </label>
          <select value={type} onChange={e => setType(e.target.value)}>
            <option value="worklog">Worklog</option>
            <option value="resolution">Resolution</option>
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Status: </label>
          <select value={status ?? ''} onChange={e => setStatus(e.target.value)}>
            <option value="">Select</option>
            <option value={1}>Assigned</option>
            <option value={2}>Resolved</option>
          </select>
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Attachment (optional): </label>
          <input type="file" onChange={e => setFile(e.target.files[0])} />
        </div>
        <button type="submit" style={{ marginTop: 8 }}>Add Worklog</button>
      </form>

      <h3 style={{ marginTop: 20 }}>Attachments</h3>
      {ticket.attachments && ticket.attachments.length ? (
        <ul>
          {ticket.attachments.map(a => (
            <li key={a.attachment_id}><a href={a.filename ? `/uploads/${a.filename}` : '#'} target="_blank" rel="noreferrer">{a.original_name || a.filename}</a></li>
          ))}
        </ul>
      ) : <p>No attachments</p>}

      <form onSubmit={closeTicket} style={{ marginTop: 24 }}>
        <h4>Close Ticket</h4>
        <div>
          <label>Closure Code</label>
          <input value={closureCode} onChange={e => setClosureCode(e.target.value)} />
        </div>
        <div>
          <label>Closure Comments</label>
          <textarea value={closureComments} onChange={e => setClosureComments(e.target.value)} rows={3} style={{ width: '100%' }} />
        </div>
        <button type="submit" style={{ marginTop: 8 }}>Close Ticket</button>
      </form>
    </div>
  );
};

export default TicketDetailPage;
