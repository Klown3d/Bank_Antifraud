import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Send, Users, Target, TrendingUp, Bitcoin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [contactos, setContactos] = useState<any[]>([]);
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  
  // Transfer state
  const [origenId, setOrigenId] = useState('');
  const [destinoNumero, setDestinoNumero] = useState('');
  const [monto, setMonto] = useState('');
  const [mensaje, setMensaje] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const fetchData = async () => {
    try {
      const cuentasRes = await AxiosInstance.get('core/cuentas/');
      const cuentasData = cuentasRes.data.results ? cuentasRes.data.results : cuentasRes.data;
      setCuentas(cuentasData);
      
      if(cuentasData.length > 0 && !origenId) {
          setOrigenId(cuentasData[0].id.toString());
      }

      const contactosRes = await AxiosInstance.get('core/contactos/');
      setContactos(contactosRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCryptoData = async () => {
    try {
      // Binance API: klins for BTCUSDT, 1 day interval, last 14 days
      const res = await axios.get('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=14');
      const formatted = res.data.map((k: any) => {
         const date = new Date(k[0]);
         return {
             name: `${date.getDate()}/${date.getMonth() + 1}`,
             price: parseFloat(k[4]) // Close price
         };
      });
      setCryptoData(formatted);
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchCryptoData();
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    try {
      await AxiosInstance.post('core/transferir/', {
        cuenta_origen_id: parseInt(origenId),
        cuenta_destino_numero: destinoNumero,
        monto: parseFloat(monto),
        descripcion: 'Transferencia BlueSky'
      });
      setMensaje({ text: 'Transferencia completada exitosamente.', type: 'success' });
      setMonto('');
      setDestinoNumero('');
      fetchData();
    } catch (error: any) {
      setMensaje({ 
        text: error.response?.data?.error || 'Error al procesar transferencia.', 
        type: 'error' 
      });
    }
  };

  const currentCuenta = cuentas.find(c => c.id.toString() === origenId);

  const renderBadge = (nivel: number) => {
      if(nivel > 80) return <span className="badge badge-high">Confianza: {nivel}%</span>;
      if(nivel > 40) return <span className="badge badge-med">Confianza: {nivel}%</span>;
      return <span className="badge badge-low">Riesgo Alto</span>;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Main Balance and Chart Row */}
      <div className="grid-2-col">
          
          {/* Balance Card */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p className="label">Dinero disponible</p>
              {currentCuenta ? (
                  <>
                      <h2 style={{ fontSize: '3rem', margin: '8px 0', color: 'var(--text-main)' }}>
                          ${parseFloat(currentCuenta.saldo).toLocaleString()}
                      </h2>
                      <p style={{ color: 'var(--primary)', fontWeight: 600 }}>CBU: {currentCuenta.numero_cuenta}</p>
                      <div style={{ marginTop: '16px', background: 'var(--bg-light)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem' }}>
                        Confidencialidad Antifraude: <strong>{currentCuenta.nivel_confidencialidad}%</strong>
                      </div>
                  </>
              ) : <p style={{ color: 'var(--text-muted)' }}>No tienes cuentas bancarias abiertas. Ve a 'Abrir Cuenta' en el menú.</p>}
          </div>

          {/* Blockchain Chart Card */}
          <div className="glass-panel" style={{ padding: '24px', height: '300px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-main)' }}>
                  <Bitcoin size={20} color="#f7931a" /> Evolución Bitcoin (BTC/USDT)
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cryptoData}>
                      <defs>
                          <linearGradient id="colorBTC" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2c3e50" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#2c3e50" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis domain={['auto', 'auto']} stroke="#a0aec0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val.toLocaleString()}`} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow)' }} />
                      <Area type="monotone" dataKey="price" stroke="#2c3e50" strokeWidth={3} fillOpacity={1} fill="url(#colorBTC)" />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* Action Row */}
      <div className="grid-3-col">
          
          {/* Transfer Card */}
          <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-main)' }}>
                  <Send size={20} color="var(--primary)" /> Transferir
              </h3>
              <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input 
                      className="input-field" 
                      placeholder="CBU o Alias de destino" 
                      value={destinoNumero} 
                      onChange={e => setDestinoNumero(e.target.value)} 
                      required 
                      disabled={!currentCuenta}
                  />
                  <input 
                      type="number" 
                      step="0.01"
                      className="input-field" 
                      placeholder="Monto $" 
                      value={monto} 
                      onChange={e => setMonto(e.target.value)} 
                      required 
                      disabled={!currentCuenta}
                  />
                  {mensaje && (
                      <div style={{ padding: '8px', borderRadius: '4px', background: mensaje.type === 'error' ? 'var(--danger)' : 'var(--accent)', color: 'white', fontSize: '0.875rem' }}>
                          {mensaje.text}
                      </div>
                  )}
                  <button type="submit" className="btn-primary" disabled={!currentCuenta}>Continuar</button>
              </form>
          </div>

          {/* Contacts & Trust */}
          <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-main)' }}>
                  <Users size={20} color="var(--primary)" /> Contactos Frecuentes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {contactos.length === 0 ? <p className="label">Aún no tienes contactos.</p> : null}
                  {contactos.map((c: any, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '6px' }}>
                          <div>
                              <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.nombre}</p>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CBU: {c.numero_cuenta}</p>
                          </div>
                          {renderBadge(c.nivel_confidencialidad)}
                      </div>
                  ))}
              </div>
          </div>

          {/* Inversiones & Reservas */}
          <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-main)' }}>
                  <TrendingUp size={20} color="var(--primary)" /> Inversiones y Reservas
              </h3>
              {currentCuenta && currentCuenta.inversiones && currentCuenta.inversiones.length > 0 ? (
                  currentCuenta.inversiones.map((inv: any) => (
                      <div key={inv.id} style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px', marginBottom: '8px' }}>
                          <p style={{ fontWeight: 600 }}>{inv.tipo.replace('_', ' ')}</p>
                          <p style={{ color: 'var(--accent)', fontWeight: 'bold' }}>${inv.monto_invertido}</p>
                          <p className="label" style={{ margin: 0, fontSize: '0.75rem' }}>Rendimiento: {inv.rendimiento_diario_estimado}% diario</p>
                      </div>
                  ))
              ) : (
                  <div style={{ padding: '12px', border: '1px dashed var(--border)', borderRadius: '6px', textAlign: 'center', marginBottom: '12px' }}>
                      <p className="label">No tienes inversiones activas</p>
                  </div>
              )}
              
              <h4 style={{ margin: '16px 0 8px 0', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span><Target size={14} /> Mis Reservas</span>
                <a href="/reservas" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Gestionar</a>
              </h4>
              {currentCuenta && currentCuenta.reservas && currentCuenta.reservas.length > 0 ? (
                  currentCuenta.reservas.map((res: any) => (
                      <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ fontSize: '0.875rem' }}>{res.nombre}</span>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>${res.saldo_acumulado} / ${res.objetivo_monto}</span>
                      </div>
                  ))
              ) : (
                  <p className="label">No has creado metas de ahorro.</p>
              )}
          </div>

      </div>
    </div>
  );
};

export default Dashboard;