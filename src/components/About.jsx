import React from 'react';
import { MapPin, Clock } from 'lucide-react';

export default function About() {
  return (
    <section id="nosotros" className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="about-grid">
          {/* Text Left */}
          <div className="about-text animate-slide-up">
            <p className="about-tagline">Conócenos</p>
            <h2 className="about-title">Comida Rápida Artesanal y Helados Gourmet</h2>
            <p className="about-desc">
              Fundado en 2012, Rápido & Deli ha redefinido el concepto de comida rápida artesanal y heladería en la ciudad. Nos esforzamos por ofrecer hamburguesas jugosas preparadas con carne 100% de res seleccionada, perros calientes gigantes con ingredientes premium y helados artesanales cremosos hechos al instante.
            </p>
            <p className="about-desc" style={{ color: 'var(--text-secondary)' }}>
              Cada producto es preparado al instante con ingredientes locales frescos y salsas secretas de la casa. Creemos que tus antojos favoritos merecen ser elevados al máximo nivel de calidad y sabor.
            </p>
            
            {/* Stats */}
            <div className="about-stats" style={{ marginBottom: '24px' }}>
              <div className="stat-item">
                <div className="stat-number">12+</div>
                <div className="stat-label">Años de Sabor</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Artesanal y Fresco</div>
              </div>
            </div>

            {/* Ubicación y Horarios */}
            <div className="about-info-block" style={{ marginTop: '28px', padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-secondary)', textAlign: 'left' }}>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={20} className="text-gold" /> Ubicación y Horarios en Quibdó
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ minWidth: '70px' }}>Dirección:</strong> 
                <span>Carrera 3 # 24 - 45, Quibdó, Chocó, Colombia</span>
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ minWidth: '70px' }}>Horario:</strong> 
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} className="text-gold" /> Lunes a Sábado: 12:00 PM - 10:00 PM \| Dom: 12:00 PM - 9:00 PM
                </span>
              </p>
              <a 
                href="https://maps.google.com/?q=Carrera+3+24-45+Quibdo" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary" 
                style={{ padding: '8px 16px', fontSize: '0.8rem', textTransform: 'none', letterSpacing: '0.5px', borderRadius: '20px' }}
              >
                Ver en Google Maps
              </a>
            </div>
          </div>

          {/* Image Right */}
          <div className="about-image-container animate-fade-in">
            <img 
              src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=60&w=500" 
              alt="Hamburguesa premium con papas fritas crujientes" 
              className="about-img"
            />
            <div className="about-badge">
              Calidad
              <span>Gourmet</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
