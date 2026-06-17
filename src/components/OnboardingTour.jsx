import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function OnboardingTour({ 
  isOpen, 
  onClose, 
  addToCart, 
  menuItems, 
  openCheckout, 
  closeCheckout, 
  cartCount 
}) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (!isOpen || step === -1) return;

    const updateRect = () => {
      let selector = '';
      if (step === 2) selector = '#tour-first-add-btn';
      if (step === 3) selector = '#nombre'; // Target name input inside modal
      if (step === 4) selector = '#tour-payment-selector'; // Target payment grid
      if (step === 5) selector = '#tour-submit-order-btn'; // Target final submit button

      if (step === 1) {
        setRect({ isScrollStep: true });
        return;
      }

      if (!selector) {
        setRect(null);
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
      // Automatically add the first menu item to the cart if cart is empty
      if (cartCount === 0 && menuItems && menuItems.length > 0) {
        addToCart(menuItems[0]);
      }
      // Open the checkout modal
      openCheckout();
      
      // Delay step transition slightly so the modal finishes opening and DOM elements are present
      setTimeout(() => {
        setStep(3);
      }, 300);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else if (step === 5) {
      closeCheckout();
      completeTour();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      // If going back to step 2, close the checkout modal
      if (step === 3) {
        closeCheckout();
      }
      setStep((prev) => prev - 1);
    }
  };

  const completeTour = () => {
    try {
      localStorage.setItem('rapido_deli_tour_completed', 'true');
    } catch (e) {
      console.warn('LocalStorage not supported:', e);
    }
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
      desc: "Desliza hacia abajo o haz clic en las categorías para ver todas nuestras hamburguesas, acompañamientos y helados.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "🛒 Paso 2: Agrega al Pedido",
      desc: "Haz clic en 'Agregar al Pedido' en tu plato favorito. Se guardará en tu carrito de compras y se abrirá el formulario de envío.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "👤 Paso 3: Datos de Envío",
      desc: "Escribe aquí tu Nombre, Teléfono de contacto y la Dirección exacta para poder despachar tu domicilio.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "💳 Paso 4: Método de Pago",
      desc: "Elige tu método de pago preferido: Efectivo contra entrega o Transferencia electrónica mediante Nequi / Bancolombia.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "📞 Paso 5: Confirma tu Pedido",
      desc: "Finalmente, haz clic aquí. Te redirigirá automáticamente a WhatsApp con el mensaje ya estructurado para enviarlo con un solo toque.",
      btnText: "¡Entendido, a pedir! 🎉",
      showProgress: true
    }
  ];

  const currentContent = stepsContent[step];

  // Smart coordinates calculation for tooltips & pointers
  const getLayout = () => {
    if (step === 0) {
      return {
        pointerStyle: { display: 'none' },
        tooltipStyle: {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '400px',
          zIndex: 100000
        },
        emoji: '👇'
      };
    }

    if (step === 1) {
      return {
        pointerStyle: {
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '3.5rem',
          zIndex: 100000,
          animation: 'bounce-hand-down 1.2s infinite'
        },
        tooltipStyle: {
          position: 'fixed',
          bottom: '180px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '320px',
          zIndex: 100000
        },
        emoji: '👇'
      };
    }

    if (!rect) {
      return {
        pointerStyle: { display: 'none' },
        tooltipStyle: {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '320px',
          zIndex: 100000
        },
        emoji: '👇'
      };
    }

    // Determine vertical layout spacing to avoid page borders
    const spaceOnTop = rect.top > 200;
    const emoji = spaceOnTop ? '👇' : '👆';
    const animation = spaceOnTop ? 'bounce-hand-down 1.2s infinite' : 'bounce-hand-up 1.2s infinite';
    
    const pointerTop = spaceOnTop ? `${rect.top - 70}px` : `${rect.bottom + 10}px`;
    const tooltipTop = spaceOnTop ? `${rect.top - 195}px` : `${rect.bottom + 80}px`;

    // Slight adjustment for mobile checkout form
    const isStep345 = step >= 3;
    const tooltipLeft = isStep345 
      ? `${rect.left + rect.width / 2 - 10}px` 
      : `${rect.left + rect.width / 2}px`;

    return {
      pointerStyle: {
        position: 'fixed',
        top: pointerTop,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)',
        fontSize: '3.5rem',
        zIndex: 100002,
        animation: animation
      },
      tooltipStyle: {
        position: 'fixed',
        top: tooltipTop,
        left: tooltipLeft,
        transform: 'translateX(-50%)',
        width: '90%',
        maxWidth: '320px',
        zIndex: 100002
      },
      emoji
    };
  };

  const layout = getLayout();

  return (
    <>
      {/* Backdrop dark shadow overlay */}
      <div className="onboarding-overlay" onClick={completeTour} />

      {/* Pointing Hand Indicator */}
      {step > 0 && (
        <div className="onboarding-pointer" style={layout.pointerStyle}>
          {layout.emoji}
        </div>
      )}

      {/* Explanatory Tooltip Card */}
      <div className="onboarding-tooltip glassmorphic" style={layout.tooltipStyle}>
        <button className="onboarding-close-btn" onClick={completeTour} title="Saltar guía">
          <X size={16} />
        </button>

        <h4 className="onboarding-title">{currentContent.title}</h4>
        <p className="onboarding-desc">{currentContent.desc}</p>

        {currentContent.showProgress && (
          <div className="onboarding-progress">
            <div className="onboarding-progress-dots">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`progress-dot ${step === s ? 'active' : ''}`} />
              ))}
            </div>
            <span className="onboarding-step-num">Paso {step} de 5</span>
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
            {step < 5 && <ArrowRight size={14} style={{ marginLeft: '4px' }} />}
          </button>
        </div>
      </div>
    </>
  );
}
