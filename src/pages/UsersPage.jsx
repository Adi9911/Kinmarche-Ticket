import React, { useEffect, useState } from 'react';
import api from '../api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER', location_id: '', department_id: '', status: 1 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchLocations();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get('/users');
    setUsers(res.data);
  };

  const fetchLocations = async () => {
    const res = await api.get('/locations');
    setLocations(res.data);
  };

  const fetchDepartments = async () => {
    const res = await api.get('/departments');
    setDepartments(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/users/${editingId}`, formData);
    } else {
      await api.post('/users', formData);
    }
    setFormData({ name: '', email: '', password: '', role: 'USER', location_id: '', department_id: '', status: 1 });
    setEditingId(null);
    fetchUsers();
  };

  const handleEdit = (user) => {
    setEditingId(user.user_id);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '', // Password update not handled in this simple form for security
      role: user.role, 
      location_id: user.location_id || '', 
      department_id: user.department_id || '',
      status: user.status 
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await api.delete(`/users/${id}`);
      fetchUsers();
    }
  };

  return (
    <div className="main-content">
      <div className="card">
        <h2>{editingId ? 'Edit User' : 'Add User'}</h2>
        <form onSubmit={handleSubmit}>
          <input placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          {!editingId && <input placeholder="Password" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />}
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="USER">USER</option>
            <option value="ENGINEER">ENGINEER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          <select value={formData.location_id} onChange={e => setFormData({...formData, location_id: e.target.value})}>
            <option value="">Select Location</option>
            {locations.map(loc => <option key={loc.location_id} value={loc.location_id}>{loc.name}</option>)}
          </select>
          <select value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
            <option value="">Select Department</option>
            {departments.filter(d => d.location_id == formData.location_id).map(dept => (
              <option key={dept.department_id} value={dept.department_id}>{dept.name}</option>
            ))}
          </select>
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', email:'', password:'', role:'USER', location_id:'', department_id:'', status:1})}}>Cancel</button>}
        </form>
      </div>
      <div className="card">
        <h3>User List</h3>
        <ul>
          {users.map(u => (
            <li key={u.user_id}>
              {u.name} ({u.email}) - {u.role}
              <button onClick={() => handleEdit(u)}>Edit</button>
              <button onClick={() => handleDelete(u.user_id)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UsersPage;
