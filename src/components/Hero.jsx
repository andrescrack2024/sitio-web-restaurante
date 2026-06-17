import { ArrowRight, ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <img 
        src="https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=60&w=800" 
        alt="Hamburguesas y papas fritas gourmet" 
        className="hero-overlay-img"
      />
      <div className="container">
        <div className="hero-content animate-slide-up">
          <p className="hero-tagline">Comida Rápida Artesanal & Heladería</p>
          <h1 className="hero-title">
            Sabor irresistible en cada <span className="text-gold">bocado</span>
          </h1>
          <p className="hero-desc">
            Bienvenidos a Rápido & Deli, el lugar donde las hamburguesas más jugosas de carne 100% de res y los helados artesanales más cremosos se encuentran para deleitar tu paladar.
          </p>
          <div className="hero-btns">
            <a href="#menu" className="btn btn-primary">
              Ordenar Ahora <ArrowRight size={18} />
            </a>
            <a href="#nosotros" className="btn btn-secondary">
              Conócenos
            </a>
          </div>
        </div>
      </div>
      <a href="#menu" className="scroll-indicator" aria-label="Deslizar hacia abajo para ver el menú">
        <span>Desliza para ver el menú</span>
        <ChevronDown size={20} className="text-gold" />
      </a>
    </section>
  );
}
