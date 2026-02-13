import React, { useEffect, useState } from 'react';
import api from '../api';

const StoresPage = () => {
  const [stores, setStores] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [formData, setFormData] = useState({ name: '', location_id: '', department_id: '', engineer_id: '', status: 1 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchStores();
    fetchLocations();
    fetchDepartments();
    fetchEngineers();
  }, []);

  const fetchStores = async () => {
    const res = await api.get('/stores');
    setStores(res.data);
  };

  const fetchLocations = async () => {
    const res = await api.get('/locations');
    setLocations(res.data);
  };

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    setDepartments(res.data);
  };

  const fetchEngineers = async () => {
    const res = await api.get('/engineers');
    setEngineers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/stores/${editingId}`, formData);
    } else {
      await api.post('/stores', formData);
    }
    setFormData({ name: '', location_id: '', department_id: '', engineer_id: '', status: 1 });
    setEditingId(null);
    fetchStores();
  };

  const handleEdit = (store) => {
    setEditingId(store.store_id);
    setFormData({ 
      name: store.name, 
      location_id: store.location_id, 
      department_id: store.department_id, 
      engineer_id: store.engineer_id || '', 
      status: store.status 
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/stores/${id}`);
      fetchStores();
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2>{editingId ? 'Edit Store' : 'Add Store'}</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Store Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <select value={formData.location_id} onChange={e => setFormData({...formData, location_id: e.target.value})} required>
            <option value="">Select Location</option>
            {locations.map(loc => <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>)}
          </select>
          <select value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})} required>
            <option value="">Select Department</option>
            {departments.filter(d => d.location_id == formData.location_id).map(dept => (
              <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
            ))}
          </select>
          <select value={formData.engineer_id} onChange={e => setFormData({...formData, engineer_id: e.target.value})}>
            <option value="">Select Preferred Engineer (Optional)</option>
            {engineers.filter(en => en.location_id == formData.location_id).map(en => (
              <option key={en.engineer_id} value={en.engineer_id}>{en.name}</option>
            ))}
          </select>
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', location_id:'', department_id:'', engineer_id:'', status:1})}}>Cancel</button>}
        </form>
      </div>
      <div className="card">
        <h3>Store List</h3>
        <ul>
          {stores.map(store => (
            <li key={store.store_id}>
              {store.name} - {locations.find(l => l.location_id === store.location_id)?.name}
              <button onClick={() => handleEdit(store)}>Edit</button>
              <button onClick={() => handleDelete(store.store_id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StoresPage;
