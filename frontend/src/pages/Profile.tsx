import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { User as UserIcon, CheckCircle, AlertTriangle, Mail } from 'lucide-react';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [mensaje, setMensaje] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      try {
        const res = await axios.get('http://localhost:8000/api/core/profile/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile", err);
      }
    };
    fetchProfile();
  }, []);

  const resendEmail = async () => {
    const token = localStorage.getItem('access_token');
    try {
      await axios.post('http://localhost:8000/api/core/resend-verification/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje({ text: 'Correo de verificación reenviado exitosamente. Revisa tu bandeja.', type: 'success' });
    } catch (err: any) {
      setMensaje({ text: err.response?.data?.error || 'Error al reenviar correo.', type: 'error' });
    }
  };

  if (!profile) return <div style={{ padding: '40px' }}>Cargando perfil...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Gestión de Perfil</h2>
      
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ background: 'var(--bg-light)', padding: '24px', borderRadius: '50%' }}>
            <UserIcon size={64} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{profile.username}</h3>
            
            {profile.is_email_verified ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontWeight: 600 }}>
                  <CheckCircle size={20} /> Email Verificado Exitosamente
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: 600 }}>
                      <AlertTriangle size={20} /> Correo No Verificado
                    </div>
                    <button onClick={resendEmail} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                        <Mail size={16} /> Reenviar Correo de Verificación
                    </button>
                    {mensaje && <p style={{ fontSize: '0.875rem', color: mensaje.type === 'success' ? 'var(--accent)' : 'var(--danger)' }}>{mensaje.text}</p>}
                </div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
             <label className="label">Correo Electrónico</label>
             <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile.email}</p>
          </div>
          <div>
             <label className="label">DNI Registrado</label>
             <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>{profile.dni || 'No especificado'}</p>
          </div>
        </div>

        <div style={{ marginTop: '32px', padding: '16px', background: 'var(--bg-light)', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <AlertTriangle color="#ff9800" size={24} />
            <div>
               <p style={{ fontWeight: 600, margin: 0 }}>Importante</p>
               <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  BlueSky nunca te solicitará tu contraseña por teléfono o correo electrónico. Si notas actividad sospechosa, el Motor Antifraude bloqueará preventivamente tus cuentas.
               </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
