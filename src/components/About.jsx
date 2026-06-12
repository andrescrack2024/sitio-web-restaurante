import React from 'react';

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
            <div className="about-stats">
              <div className="stat-item">
                <div className="stat-number">12+</div>
                <div className="stat-label">Años de Sabor</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Artesanal y Fresco</div>
              </div>
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
