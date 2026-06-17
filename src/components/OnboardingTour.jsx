import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function OnboardingTour({ isOpen, onClose }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!isOpen || step === -1) return;

    const updateRect = () => {
      let selector = '';
      if (step === 2) selector = '#tour-first-add-btn';
      if (step === 3) selector = '#tour-whatsapp-btn';

      if (step === 1) {
        setRect({ isScrollStep: true });
        return;
      }

      const el = document.querySelector(selector);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        setRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    
    // Periodically update to align perfectly during scroll/animations
    const interval = setInterval(updateRect, 100);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
      clearInterval(interval);
    };
  }, [isOpen, step]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      // Scroll smoothly to the menu section
      const menuSection = document.querySelector('#menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => {
        setStep(2);
      }, 700);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      completeTour();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const completeTour = () => {
    localStorage.setItem('rapido_deli_tour_completed', 'true');
    onClose();
  };

  const stepsContent = [
    {
      title: "🍔 ¡Bienvenido a Rápido & Deli!",
      desc: "Te enseñamos brevemente cómo funciona nuestra plataforma para que realices tus pedidos interactivos por WhatsApp rápido y sin errores.",
      btnText: "Iniciar Guía 🚀",
      showProgress: false
    },
    {
      title: "📜 Paso 1: Explora el Menú",
      desc: "Desliza hacia abajo o haz clic en las categorías para ver todas nuestras hamburguesas, acompañamientos y deliciosos helados.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "🛒 Paso 2: Agrega al Pedido",
      desc: "Haz clic en 'Agregar al Pedido' en tus platos preferidos. Se guardarán en tu carrito de compras y verás cómo el contador aumenta.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "📞 Paso 3: Envía por WhatsApp",
      desc: "Cuando termines, haz clic en este botón verde flotante para rellenar tus datos de entrega y enviarnos el pedido completo a nuestro WhatsApp.",
      btnText: "¡Entendido, a pedir! 🎉",
      showProgress: true
    }
  ];

  const currentContent = stepsContent[step];

  // Dynamic Styles Calculation during Render
  const getTooltipStyle = () => {
    if (step === 0) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '400px',
        zIndex: 100000
      };
    }
    if (step === 1) {
      return {
        position: 'fixed',
        bottom: '180px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '320px',
        zIndex: 100000
      };
    }
    if (!rect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '320px',
        zIndex: 100000
      };
    }
    
    if (step === 2) {
      return {
        position: 'fixed',
        top: `${rect.bottom + 80}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '320px',
        zIndex: 100000
      };
    }
    
    if (step === 3) {
      return {
        position: 'fixed',
        top: `${rect.top - 200}px`,
        left: `${rect.left + rect.width / 2 - 20}px`,
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '320px',
        zIndex: 100000
      };
    }
    return {};
  };

  const getPointerStyle = () => {
    if (step === 0) return { display: 'none' };
    if (step === 1) {
      return {
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '3.5rem',
        zIndex: 100000,
        animation: 'bounce-hand-down 1.2s infinite'
      };
    }
    if (!rect) return { display: 'none' };
    
    if (step === 2) {
      return {
        position: 'fixed',
        top: `${rect.bottom + 10}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)',
        fontSize: '3.5rem',
        zIndex: 100000,
        animation: 'bounce-hand-up 1.2s infinite'
      };
    }
    
    if (step === 3) {
      return {
        position: 'fixed',
        top: `${rect.top - 70}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)',
        fontSize: '3.5rem',
        zIndex: 100000,
        animation: 'bounce-hand-down 1.2s infinite'
      };
    }
    return {};
  };

  const getPointerEmoji = () => {
    if (step === 2) return '👆';
    return '👇';
  };

  return (
    <>
      {/* Backdrop dark shadow overlay */}
      <div className="onboarding-overlay" onClick={completeTour} />

      {/* Pointing Hand Indicator */}
      {step > 0 && (
        <div className="onboarding-pointer" style={getPointerStyle()}>
          {getPointerEmoji()}
        </div>
      )}

      {/* Explanatory Tooltip Card */}
      <div className="onboarding-tooltip glassmorphic" style={getTooltipStyle()}>
        <button className="onboarding-close-btn" onClick={completeTour} title="Saltar guía">
          <X size={16} />
        </button>

        <h4 className="onboarding-title">{currentContent.title}</h4>
        <p className="onboarding-desc">{currentContent.desc}</p>

        {currentContent.showProgress && (
          <div className="onboarding-progress">
            <div className="onboarding-progress-dots">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`progress-dot ${step === s ? 'active' : ''}`} />
              ))}
            </div>
            <span className="onboarding-step-num">Paso {step} de 3</span>
          </div>
        )}

        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={handlePrev}>
              Atrás
            </button>
          )}
          <button className="btn btn-primary btn-sm onboarding-next-btn" onClick={handleNext}>
            {currentContent.btnText}
            {step < 3 && <ArrowRight size={14} style={{ marginLeft: '4px' }} />}
          </button>
        </div>
      </div>
    </>
  );
}
