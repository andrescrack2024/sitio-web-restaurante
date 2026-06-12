import React from 'react';
import { Star } from 'lucide-react';

export default function Testimonials() {
  const reviews = [
    {
      name: 'Alejandro Restrepo',
      role: 'Crítico Gastronómico',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
      text: 'El Salmón en Salsa de Eneldo es simplemente espectacular. La cocción del pescado es perfecta y el puré trufado eleva la experiencia por completo. ¡Altamente recomendado!',
      stars: 5
    },
    {
      name: 'Sofia Varela',
      role: 'Cliente Frecuente',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
      text: 'La facilidad para ordenar por aquí es genial. Eliges los platos, pones tu dirección, y el chat de WhatsApp ya tiene todo listo. El servicio a domicilio fue rápido y caliente.',
      stars: 5
    },
    {
      name: 'Carlos Mendoza',
      role: 'Aficionado Culinario',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120',
      text: 'El Volcán de Chocolate es el mejor postre que he probado en años. El centro líquido es perfecto. La calidad del chocolate se nota desde el primer bocado. Servicio impecable.',
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
          Descubra las opiniones de quienes ya han disfrutado de nuestra experiencia gastronómica exclusiva.
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
