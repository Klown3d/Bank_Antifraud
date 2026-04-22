import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Wallet, Send, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const AxiosInstance = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

AxiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const Dashboard: React.FC = () => {
  const [cuentas, setCuentas] = useState<any[]>([]);
  const [transacciones, setTransacciones] = useState<any[]>([]);
  
  // Transfer state
  const [origenId, setOrigenId] = useState('');
  const [destinoNumero, setDestinoNumero] = useState('');
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const cuentasRes = await AxiosInstance.get('core/cuentas/');
      const cuentasData = cuentasRes.data.results ? cuentasRes.data.results : cuentasRes.data;
      setCuentas(cuentasData);
      
      if(cuentasData.length > 0 && !origenId) {
          setOrigenId(cuentasData[0].id.toString());
      }

      const txRes = await AxiosInstance.get('core/transacciones/');
      const txData = txRes.data.results ? txRes.data.results : txRes.data;
      setTransacciones(txData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    try {
      const res = await AxiosInstance.post('core/transferir/', {
        cuenta_origen_id: parseInt(origenId),
        cuenta_destino_numero: destinoNumero,
        monto: parseFloat(monto),
        descripcion: 'Transferencia desde Web'
      });
      setMensaje({ text: 'Transferencia completada exitosamente.', type: 'success' });
      setMonto('');
      setDestinoNumero('');
      fetchData(); // Refresh data
    } catch (error: any) {
      setMensaje({ 
        text: error.response?.data?.error || 'Error al procesar transferencia.', 
        type: 'error' 
      });
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 700 }}>
          <Wallet color="var(--primary)" /> Mi Billetera
        </h1>
        <button onClick={handleLogout} className="btn-primary" style={{ width: 'auto', background: 'transparent', border: '1px solid var(--glass-border)' }}>
          Cerrar Sesión
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {cuentas.map(cuenta => (
          <div key={cuenta.id} className="glass-panel" style={{ padding: '24px' }}>
            <p className="label">Cuenta {cuenta.tipo_cuenta.replace('_', ' ')}</p>
            <h2 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--accent)' }}>
              ${parseFloat(cuenta.saldo).toLocaleString()}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>CBU / Nro: {cuenta.numero_cuenta}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Send color="var(--primary)" /> Realizar Transferencia
          </h3>
          <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="label">Cuenta Origen</label>
              <select className="input-field" value={origenId} onChange={e => setOrigenId(e.target.value)} required>
                {cuentas.map(c => <option key={c.id} value={c.id}>{c.numero_cuenta} (${c.saldo})</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cuenta Destino (Ingresa 200000000002 para tienda_destino)</label>
              <input 
                className="input-field" 
                placeholder="Número de CBU" 
                value={destinoNumero} 
                onChange={e => setDestinoNumero(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label className="label">Monto a Transferir ($)</label>
              <input 
                type="number" 
                step="0.01"
                className="input-field" 
                placeholder="0.00" 
                value={monto} 
                onChange={e => setMonto(e.target.value)} 
                required 
              />
            </div>
            
            {mensaje && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', background: mensaje.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: mensaje.type === 'error' ? 'var(--danger)' : 'var(--accent)' }}>
                {mensaje.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                {mensaje.text}
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
              Confirmar Transferencia
            </button>
          </form>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <FileText color="var(--primary)" /> Movimientos Recientes
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
            {transacciones.length === 0 ? <p className="label">No hay movimientos.</p> : null}
            {transacciones.map(tx => {
               // Verify if outgoing or incoming based on the current originId (simplified logic)
               const isOutgoing = cuentas.some(c => c.id === tx.cuenta_origen);
               return (
                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: `4px solid ${isOutgoing ? 'var(--danger)' : 'var(--accent)'}` }}>
                  <div>
                    <p style={{ fontWeight: 600 }}>{tx.tipo} {tx.estado === 'SOSPECHOSA' ? '(Bajo Análisis)' : ''}</p>
                    <p className="label" style={{ margin: 0 }}>{new Date(tx.fecha).toLocaleString()}</p>
                  </div>
                  <div style={{ fontWeight: 700, color: isOutgoing ? 'var(--danger)' : 'var(--accent)' }}>
                    {isOutgoing ? '-' : '+'}${parseFloat(tx.monto).toLocaleString()}
                  </div>
                </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
