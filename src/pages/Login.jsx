import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Simple fractal-inspired SVG logo
function FractalLogo() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" stroke="var(--primary)" strokeWidth="4" fill="var(--sidebar)" />
      <g stroke="var(--primary)" strokeWidth="2">
        <path d="M32 12 L32 52" />
        <path d="M12 32 L52 32" />
        <path d="M22 22 L42 42" />
        <path d="M42 22 L22 42" />
        <circle cx="32" cy="32" r="8" fill="var(--primary)" />
      </g>
    </svg>
  );
}

export default function Login({ onLogin }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const res = login(username, password);
    if (res.success) {
      if (onLogin) onLogin();
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center mb-8">
        <FractalLogo />
        <h1 className="mt-4 text-3xl font-extrabold text-primary tracking-tight drop-shadow-sm">Fractal <span className="text-primary"></span></h1>
        <p className="text-foreground text-sm mt-1 font-medium tracking-wide">Electronic Health Record System</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-xl shadow-xl w-80 backdrop-blur-md border border-border">
        <h2 className="text-2xl font-bold mb-4 text-primary">Login</h2>
        {error && <div className="text-destructive mb-2">{error}</div>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
          required
        />
        <button type="submit" className="w-full bg-primary hover:bg-primary/90 transition text-primary-foreground py-2 rounded font-semibold shadow">Login</button>
      </form>
    </div>
  );
} 