import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Alejandro Restrepo',
      role: 'Cliente Frecuente',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      text: 'La hamburguesa suprema doble carne es de otro mundo. Súper jugosa, la tocineta está en su punto y las papas rústicas al romero son el acompañamiento perfecto. ¡Espectacular!',
      stars: 5
    },
    {
      name: 'Sofia Varela',
      role: 'Cliente Satisfecha',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      text: 'Hacer el pedido por aquí es facilísimo. Eliges las hamburguesas y los helados, pones tu dirección, y el chat de WhatsApp te lo arma al instante. El domicilio llegó rápido y todo muy caliente.',
      stars: 5
    },
    {
      name: 'Carlos Mendoza',
      role: 'Vecino del Barrio',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      text: 'La banana split y la malteada de fresa son deliciosas, súper cremosas y frescas. La atención y la presentación son excelentes. El mejor sitio de comida rápida y helados.',
      stars: 5
    }
  ];

  return (
    <section id="testimonios" className="section-padding" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: '600' }}>
          Experiencias
        </p>
        <h2 className="section-title">Lo que dicen nuestros clientes</h2>
        <p className="section-subtitle">
          Descubra las opiniones de quienes ya disfrutan de nuestras deliciosas hamburguesas artesanales, perros calientes y helados gourmet.
        </p>

        <div className="testimonials-grid">
          {reviews.map((review, index) => (
            <div key={index} className="testimonial-card animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="testimonial-stars">
                {[...Array(review.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="testimonial-text">"{review.text}"</p>
              
              <div className="testimonial-author">
                <img src={review.avatar} alt={review.name} className="testimonial-avatar" />
                <div className="author-info">
                  <h4>{review.name}</h4>
                  <p>{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
