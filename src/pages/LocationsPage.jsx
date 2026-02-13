import React, { useEffect, useState } from 'react';
import api from '../api';

const LocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({ name: '', city: '', state: '', country: '', status: 1 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const res = await api.get('/locations');
    setLocations(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/locations/${editingId}`, formData);
    } else {
      await api.post('/locations', formData);
    }
    setFormData({ name: '', city: '', state: '', country: '', status: 1 });
    setEditingId(null);
    fetchLocations();
  };

  const handleEdit = (loc) => {
    setEditingId(loc.location_id);
    setFormData({ name: loc.name, city: loc.city || '', state: loc.state || '', country: loc.country || '', status: loc.status });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/locations/${id}`);
      fetchLocations();
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2>{editingId ? 'Edit Location' : 'Add Location'}</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
          <input placeholder="State" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
          <input placeholder="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', city:'', state:'', country:'', status:1})}}>Cancel</button>}
        </form>
      </div>
      <div className="card">
        <h3>Location List</h3>
        <ul>
          {locations.map(loc => (
            <li key={loc.location_id}>
              {loc.name} ({loc.city}) 
              <button onClick={() => handleEdit(loc)}>Edit</button>
              <button onClick={() => handleDelete(loc.location_id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LocationsPage;
