import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, User, LogOut, PlusCircle, CloudRain, Target } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide sidebar on Home, Login, Register or Verify pages
  if (location.pathname === '/' || ['/login', '/register', '/verify-email'].some(path => location.pathname.startsWith(path))) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/');
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: isActive ? '#ffffff' : '#a0aec0',
    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
    fontWeight: isActive ? 600 : 400,
    transition: 'all 0.2s'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-light)' }}>
      {/* Sidebar (Desktop only) */}
      <aside className="desktop-sidebar" style={{ width: '260px', background: '#1a202c', color: 'white', padding: '24px 16px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 700, marginBottom: '40px', paddingLeft: '8px' }}>
          <CloudRain size={28} color="var(--primary)" /> BlueSky
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
          <NavLink to="/dashboard" style={navLinkStyle}>
            <LayoutDashboard size={20} /> Panel Principal
          </NavLink>
          <NavLink to="/reservas" style={navLinkStyle}>
            <Target size={20} /> Mis Reservas
          </NavLink>
          <NavLink to="/open-account" style={navLinkStyle}>
            <PlusCircle size={20} /> Abrir Cuenta
          </NavLink>
          <NavLink to="/profile" style={navLinkStyle}>
            <User size={20} /> Mi Perfil
          </NavLink>
        </nav>

        <button 
          onClick={handleLogout} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'transparent', border: 'none', color: '#fc8181', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}
        >
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>

      {/* Bottom Nav (Mobile only) */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/dashboard" className={({isActive}) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
          <span>Panel</span>
        </NavLink>
        <NavLink to="/reservas" className={({isActive}) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <Target size={24} />
          <span>Reservas</span>
        </NavLink>
        <NavLink to="/open-account" className={({isActive}) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <PlusCircle size={24} />
          <span>Cuenta</span>
        </NavLink>
        <NavLink to="/profile" className={({isActive}) => `mobile-nav-link ${isActive ? 'active' : ''}`}>
          <User size={24} />
          <span>Perfil</span>
        </NavLink>
        <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#fc8181', gap: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
          <LogOut size={24} />
          <span>Salir</span>
        </button>
      </nav>
    </div>
  );
};
