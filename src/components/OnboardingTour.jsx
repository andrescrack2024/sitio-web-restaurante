import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function OnboardingTour({ 
  isOpen, 
  onClose, 
  addToCart, 
  clearCart, 
  menuItems, 
  openCheckout, 
  closeCheckout, 
  cartCount 
}) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [didAutoAdd, setDidAutoAdd] = useState(false);

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
    
    // Periodically update to align perfectly during scroll/layouts
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
        setDidAutoAdd(true);
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
    if (didAutoAdd && clearCart) {
      clearCart();
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
      desc: "Finalmente, haz clic aquí. Te redirigirá automáticamente a WhatsApp con la plantilla de tu pedido completa para enviarla con un solo toque.",
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
          zIndex: 100002
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
          zIndex: 100002,
          animation: 'bounce-hand-down 1.2s infinite'
        },
        tooltipStyle: {
          position: 'fixed',
          top: '100px', // Below the sticky header to prevent cut-off
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '340px',
          zIndex: 100002
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
          zIndex: 100002
        },
        emoji: '👇'
      };
    }

    // Determine viewport properties
    const viewportHeight = window.innerHeight;
    const elementCenterY = rect.top + rect.height / 2;
    const isUpperHalf = elementCenterY < viewportHeight / 2;

    // 1. Tooltip Position: Place at the opposite half of the viewport to avoid overlapping the element
    const tooltipStyle = {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '320px',
      zIndex: 100002
    };

    if (isUpperHalf) {
      tooltipStyle.bottom = '80px'; // Place at bottom center, safe from mobile toolbars
    } else {
      tooltipStyle.top = '100px'; // Place at top center, safe from header and browser address bar
    }

    // 2. Pointer Position & Emoji Direction
    const pointerStyle = {
      position: 'fixed',
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
      fontSize: '3.5rem',
      zIndex: 100002
    };

    let emoji = '👇';
    // If the element is very close to the top of the viewport (less than 90px), point UP from below to avoid off-screen clipping
    if (rect.top < 90) {
      emoji = '👆';
      pointerStyle.top = `${rect.bottom + 10}px`;
      pointerStyle.animation = 'bounce-hand-up 1.2s infinite';
    } else {
      emoji = '👇';
      pointerStyle.top = `${rect.top - 70}px`;
      pointerStyle.animation = 'bounce-hand-down 1.2s infinite';
    }

    return {
      pointerStyle,
      tooltipStyle,
      emoji
    };
  };

  const layout = getLayout();

  return (
    <>
      {/* Backdrop dark shadow overlay (clicking backdrop no longer dismisses the tour to avoid accidental closure) */}
      <div className="onboarding-overlay" />

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
          {step > 0 ? (
            <button className="btn btn-secondary btn-sm" onClick={handlePrev}>
              Atrás
            </button>
          ) : (
            <button className="btn btn-secondary btn-sm" onClick={completeTour}>
              Saltar
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
