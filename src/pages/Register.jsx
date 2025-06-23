import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', name: '', role: ROLES.DOCTOR });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user || user.role !== ROLES.ADMIN) {
    return <div className="flex items-center justify-center min-h-screen text-red-600">Only admin can register new users.</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const res = register(form);
    if (res.success) {
      setSuccess('User registered successfully!');
      setForm({ username: '', password: '', name: '', role: ROLES.DOCTOR });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Register User</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full mb-2 p-2 border rounded"
          required
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value={ROLES.DOCTOR}>Doctor</option>
          <option value={ROLES.SECRETARY}>Secretary</option>
          <option value={ROLES.ASSISTANT}>Assistant</option>
          <option value={ROLES.ADMIN}>Admin</option>
        </select>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Register</button>
      </form>
    </div>
  );
} 