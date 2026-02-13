import React, { useEffect, useState } from 'react';
import api from '../api';

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({ name: '', location_id: '', status: 1 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchLocations();
  }, []);

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    setDepartments(res.data);
  };

  const fetchLocations = async () => {
    const res = await api.get('/locations');
    setLocations(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/departments/${editingId}`, formData);
    } else {
      await api.post('/departments', formData);
    }
    setFormData({ name: '', location_id: '', status: 1 });
    setEditingId(null);
    fetchDepartments();
  };

  const handleEdit = (dept) => {
    setEditingId(dept.department_id);
    setFormData({ name: dept.name, location_id: dept.location_id, status: dept.status });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2>{editingId ? 'Edit Department' : 'Add Department'}</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <select value={formData.location_id} onChange={e => setFormData({...formData, location_id: e.target.value})} required>
            <option value="">Select Location</option>
            {locations.map(loc => <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>)}
          </select>
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', location_id:'', status:1})}}>Cancel</button>}
        </form>
      </div>
      <div className="card">
        <h3>Department List</h3>
        <ul>
          {departments.map(dept => (
            <li key={dept.department_id}>
              {dept.name} - {locations.find(l => l.location_id === dept.location_id)?.name}
              <button onClick={() => handleEdit(dept)}>Edit</button>
              <button onClick={() => handleDelete(dept.department_id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DepartmentsPage;
