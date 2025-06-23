import React, { useState } from 'react';
import { useAuth, ROLES } from '../context/AuthContext.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from './ui/dialog';

export default function RegisterDialog({ open, onOpenChange }) {
  const { user, register } = useAuth();
  const [form, setForm] = useState({ username: '', password: '', name: '', role: ROLES.DOCTOR });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register User</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value={ROLES.DOCTOR}>Doctor</option>
            <option value={ROLES.SECRETARY}>Secretary</option>
            <option value={ROLES.ASSISTANT}>Assistant</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
          <div className="flex gap-2 justify-end mt-2">
            <DialogClose asChild>
              <button type="button" className="px-4 py-2 rounded bg-gray-200">Cancel</button>
            </DialogClose>
            <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">Register</button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 