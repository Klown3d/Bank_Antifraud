import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { CloudRain } from 'lucide-react';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    dni: '',
    telefono: ''
  });
  const [mensaje, setMensaje] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    try {
      await axios.post('http://localhost:8000/api/core/register/', formData);
      setMensaje({ text: 'Cuenta creada. Revisa tu consola/email para el link de verificación.', type: 'success' });
      setTimeout(() => navigate('/login'), 4000);
    } catch (err: any) {
      setMensaje({ text: 'Error en el registro. Verifique sus datos.', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: 'var(--bg-light)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '450px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CloudRain size={48} color="var(--primary)" />
        </div>
        <h2 style={{ marginBottom: '8px', fontWeight: 700, textAlign: 'center' }}>Crear Cuenta en BlueSky</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '24px' }}>Inicia tu camino financiero seguro</p>
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label">Usuario</label>
              <input className="input-field" type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input className="input-field" type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="label">Email (Se enviará link)</label>
            <input className="input-field" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label className="label">DNI</label>
              <input className="input-field" type="text" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} required />
            </div>
            <div>
              <label className="label">Teléfono (Opcional)</label>
              <input className="input-field" type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
            </div>
          </div>
          
          {mensaje && (
            <div style={{ padding: '12px', borderRadius: '4px', background: mensaje.type === 'error' ? 'var(--danger)' : 'var(--accent)', color: 'white', textAlign: 'center' }}>
              {mensaje.text}
            </div>
          )}
          
          <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
            Registrarse
          </button>
        </form>
        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)' }}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
