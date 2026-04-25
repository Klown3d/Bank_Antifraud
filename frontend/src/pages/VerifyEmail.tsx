import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { CloudRain, CheckCircle, XCircle } from 'lucide-react';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        await axios.post(`http://localhost:8000/api/core/verify-email/${token}/`);
        setStatus('success');
        setTimeout(() => navigate('/login'), 4000);
      } catch (err) {
        setStatus('error');
      }
    };
    if (token) verify();
  }, [token, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px', background: 'var(--bg-light)' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <CloudRain size={48} color="var(--primary)" style={{ margin: '0 auto 20px auto' }} />
        <h2 style={{ marginBottom: '16px', fontWeight: 700 }}>Verificación de Email</h2>
        
        {status === 'loading' && <p>Verificando tu token seguro...</p>}
        {status === 'success' && (
          <div style={{ color: 'var(--accent)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 16px auto' }} />
            <p>¡Cuenta verificada exitosamente! Redirigiendo al login...</p>
          </div>
        )}
        {status === 'error' && (
          <div style={{ color: 'var(--danger)' }}>
            <XCircle size={48} style={{ margin: '0 auto 16px auto' }} />
            <p>El token es inválido o expiró.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
