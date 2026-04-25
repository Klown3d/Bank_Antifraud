import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

const OpenAccount: React.FC = () => {
  const [mensaje, setMensaje] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

  const handleOpenAccount = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await axios.post('http://localhost:8000/api/core/cuentas/abrir/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje({ text: `¡Felicidades! Se ha abierto tu cuenta. Tu CBU es: ${res.data.cbu}`, type: 'success' });
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (err: any) {
      setMensaje({ text: err.response?.data?.error || 'Error al abrir la cuenta', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Abrir una Cuenta BlueSky</h2>
      
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
        <PlusCircle size={64} color="var(--primary)" style={{ margin: '0 auto 24px auto' }} />
        <h3 style={{ marginBottom: '16px' }}>Caja de Ahorro en Pesos</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          Abre tu primera cuenta bancaria de forma 100% digital, gratuita y protegida por nuestro Motor Antifraude de nivel bancario.
        </p>
        
        {mensaje && (
          <div style={{ padding: '12px', borderRadius: '4px', background: mensaje.type === 'error' ? 'var(--danger)' : 'var(--accent)', color: 'white', marginBottom: '24px' }}>
            {mensaje.text}
          </div>
        )}

        <button onClick={handleOpenAccount} className="btn-primary" style={{ maxWidth: '300px' }}>
          Solicitar Alta de Cuenta
        </button>
      </div>
    </div>
  );
};

export default OpenAccount;
