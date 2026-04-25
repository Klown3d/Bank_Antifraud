import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CloudRain } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('klown3d');
  const [password, setPassword] = useState('0982');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password
      });
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Credenciales no válidas. Intente de nuevo.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: 'var(--primary)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CloudRain size={48} color="var(--primary)" />
        </div>
        <h2 style={{ marginBottom: '24px', fontWeight: 600, color: 'var(--primary)' }}>BlueSky</h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label className="label">Usuario</label>
            <input 
              className="input-field" 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required
            />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input 
              className="input-field" 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
