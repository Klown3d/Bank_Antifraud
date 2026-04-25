import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Target, PlusCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

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

const Reservas: React.FC = () => {
  const [reservas, setReservas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Create state
  const [nombre, setNombre] = useState('');
  const [objetivo, setObjetivo] = useState('');
  
  // Transaction state
  const [montoTx, setMontoTx] = useState('');
  const [activeReservaId, setActiveReservaId] = useState<string | null>(null);
  const [txMode, setTxMode] = useState<'depositar' | 'retirar'>('depositar');

  const fetchReservas = async () => {
    try {
      const res = await AxiosInstance.get('core/reservas/');
      setReservas(res.data.results ? res.data.results : res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AxiosInstance.post('core/reservas/', {
        nombre,
        objetivo_monto: parseFloat(objetivo),
        saldo_acumulado: 0
      });
      setNombre('');
      setObjetivo('');
      setMensaje({ text: 'Reserva creada.', type: 'success' });
      fetchReservas();
    } catch (err: any) {
      setMensaje({ text: err.response?.data?.error || 'Error al crear reserva. ¿Tienes una cuenta activa?', type: 'error' });
    }
  };

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReservaId || !montoTx) return;
    
    try {
      const res = await AxiosInstance.post(`core/reservas/${activeReservaId}/${txMode}/`, {
        monto: parseFloat(montoTx)
      });
      setMensaje({ text: res.data.mensaje, type: 'success' });
      setMontoTx('');
      setActiveReservaId(null);
      fetchReservas();
    } catch (err: any) {
      setMensaje({ text: err.response?.data?.error || 'Error en la transacción.', type: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Target color="var(--primary)" /> Mis Reservas de Dinero
      </h2>
      
      {mensaje && (
          <div style={{ padding: '12px', borderRadius: '4px', background: mensaje.type === 'error' ? 'var(--danger)' : 'var(--accent)', color: 'white', marginBottom: '24px' }}>
            {mensaje.text}
          </div>
      )}

      <div className="grid-2-col">
        {/* Create Form */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Crear Nueva Meta</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input className="input-field" placeholder="Nombre (ej. Vacaciones)" value={nombre} onChange={e => setNombre(e.target.value)} required />
            <input type="number" step="0.01" className="input-field" placeholder="Monto Objetivo $" value={objetivo} onChange={e => setObjetivo(e.target.value)} required />
            <button type="submit" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}><PlusCircle size={20}/> Crear Reserva</button>
          </form>
        </div>

        {/* List & Transactions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reservas.length === 0 && <p className="label">No tienes reservas activas.</p>}
          
          {reservas.map((res: any) => (
             <div key={res.id} className="glass-panel" style={{ padding: '20px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                     <h4 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{res.nombre}</h4>
                     <p className="label">Objetivo: ${res.objetivo_monto}</p>
                  </div>
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>${res.saldo_acumulado}</h3>
               </div>
               
               {/* Progress bar */}
               <div style={{ width: '100%', background: 'var(--border)', height: '8px', borderRadius: '4px', marginBottom: '16px' }}>
                 <div style={{ height: '100%', background: 'var(--accent)', borderRadius: '4px', width: `${Math.min(100, (res.saldo_acumulado / res.objetivo_monto) * 100)}%` }}></div>
               </div>

               {activeReservaId === res.id ? (
                  <form onSubmit={handleTransaction} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input type="number" step="0.01" className="input-field" placeholder={`Monto a ${txMode}`} value={montoTx} onChange={e => setMontoTx(e.target.value)} required style={{ flexGrow: 1 }} />
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 16px' }}>Confirmar</button>
                    <button type="button" onClick={() => setActiveReservaId(null)} style={{ background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '6px', padding: '0 16px', cursor: 'pointer' }}>Cancelar</button>
                  </form>
               ) : (
                  <div style={{ display: 'flex', gap: '12px' }}>
                     <button onClick={() => { setActiveReservaId(res.id); setTxMode('depositar'); }} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--bg-light)', border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        <ArrowDownCircle size={18} color="var(--accent)"/> Ingresar Dinero
                     </button>
                     <button onClick={() => { setActiveReservaId(res.id); setTxMode('retirar'); }} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'var(--bg-light)', border: '1px solid var(--border)', padding: '8px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        <ArrowUpCircle size={18} color="var(--danger)"/> Retirar Dinero
                     </button>
                  </div>
               )}
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reservas;
