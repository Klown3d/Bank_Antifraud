import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Smartphone, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', position: 'absolute', width: '100%', zIndex: 10 }}>
        <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700, margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>BlueSky</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/login" style={{ padding: '10px 20px', color: 'white', textDecoration: 'none', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Iniciar Sesión</Link>
          <Link to="/register" style={{ padding: '10px 20px', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 600 }}>Registrarse</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ 
        position: 'relative', 
        height: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 10%',
        background: 'url(/bluesky_hero_family_1777113230866.png) center/cover no-repeat',
      }}>
        {/* Dark overlay for contrast */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, rgba(10,14,23,0.8) 0%, rgba(10,14,23,0.4) 100%)', zIndex: 1 }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px', color: 'white' }}>
          <h2 className="hero-title" style={{ fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
            Protege el futuro de tu familia con BlueSky
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '32px', color: '#e2e8f0', lineHeight: 1.5 }}>
            La única plataforma financiera con Motor Antifraude Inteligente. Obtén préstamos justos, invierte en blockchain y ahorra con la máxima seguridad.
          </p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--accent)', color: 'white', padding: '14px 28px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem', transition: 'transform 0.2s' }}>
            Abre tu cuenta gratis <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: 'var(--bg-light)', padding: '80px 10%', flexGrow: 1 }}>
        <h3 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '60px', color: 'var(--text-main)' }}>Por qué elegirnos</h3>
        
        <div className="grid-3-col">
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <ShieldCheck size={48} color="var(--primary)" style={{ margin: '0 auto 20px auto' }} />
            <h4 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Seguridad de Grado Militar</h4>
            <p style={{ color: 'var(--text-muted)' }}>Nuestro Motor Antifraude de IA detecta operaciones sospechosas en milisegundos, bloqueando amenazas antes de que ocurran.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <TrendingUp size={48} color="var(--primary)" style={{ margin: '0 auto 20px auto' }} />
            <h4 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Inversiones Inteligentes</h4>
            <p style={{ color: 'var(--text-muted)' }}>Accede a Fondos Comunes y gráficas de la Blockchain en tiempo real para hacer crecer tu capital de manera sencilla.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <Smartphone size={48} color="var(--primary)" style={{ margin: '0 auto 20px auto' }} />
            <h4 style={{ fontSize: '1.25rem', marginBottom: '12px' }}>Experiencia 100% Digital</h4>
            <p style={{ color: 'var(--text-muted)' }}>Controla tu dinero, abre cuentas y transfiere a tus contactos frecuentes con un solo click desde cualquier dispositivo.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
