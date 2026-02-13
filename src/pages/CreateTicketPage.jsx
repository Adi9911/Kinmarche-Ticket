import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const CreateTicketPage = () => {
  const [stores, setStores] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
    fetchStores();
  }, []);

  const fetchLocations = async () => {
    const res = await api.get('/locations');
    setLocations(res.data);
  };

  const fetchStores = async () => {
    const res = await api.get('/stores');
    setStores(res.data);
  };

  const handleLocationChange = async (locId) => {
    setSelectedLocation(locId);
    setSelectedStore('');
    if (locId) {
      const res = await api.get(`/engineers?location_id=${locId}`);
      setEngineers(res.data);
    } else {
      setEngineers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStore) {
        alert("Please select a store.");
        return;
    }

    try {
      const res = await api.post('/tickets', { 
          store_id: selectedStore, 
          title, 
          description,
          engineer_id: selectedEngineer 
      });
      // navigate to ticket detail page and show ticket number if available
      const ticketId = res.data.ticket_id;
      navigate(`/tickets/${ticketId}`);
    } catch (err) {
      alert("Failed to create ticket: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2 className="branding-red">Raise New Ticket</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Location: </label>
            <select value={selectedLocation} onChange={e => handleLocationChange(e.target.value)} required>
              <option value="">Select Location</option>
              {locations.map(loc => <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>)}
            </select>
          </div>
          <div>
            <label>Store: </label>
            <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} required>
              <option value="">Select Store</option>
              {stores.filter(s => s.location_id == selectedLocation).map(s => (
                <option key={s.store_id} value={s.store_id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Engineer (Optional): </label>
            <select value={selectedEngineer} onChange={e => setSelectedEngineer(e.target.value)}>
              <option value="">Auto-assign</option>
              {engineers.map(eng => <option key={eng.engineer_id} value={eng.engineer_id}>{eng.name}</option>)}
            </select>
          </div>
          <div>
            <input placeholder="Ticket Title" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div>
            <textarea placeholder="Problem Description" value={description} onChange={e => setDescription(e.target.value)} rows="4" />
          </div>
          <button type="submit" style={{ width: '100%' }}>Create Ticket</button>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketPage;
