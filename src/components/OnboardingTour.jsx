import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';

export default function OnboardingTour({ 
  isOpen, 
  isCartOpen,
  onClose, 
  addToCart, 
  clearCart, 
  menuItems, 
  openCart,
  closeCart,
  openCheckout, 
  closeCheckout, 
  cartCount 
}) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);
  const [didAutoAdd, setDidAutoAdd] = useState(false);

  // Auto-advance step if item is added to cart manually
  useEffect(() => {
    if (isOpen && cartCount > 0 && step === 2) {
      setStep(3);
    }
  }, [cartCount, isOpen, step]);

  // Auto-advance step if cart is opened manually
  useEffect(() => {
    if (isOpen && isCartOpen && step === 3) {
      setStep(4);
    }
  }, [isCartOpen, isOpen, step]);

  // Scroll target element into view when step changes
  useEffect(() => {
    if (!isOpen || step === -1) return;

    let selector = '';
    if (step === 1) selector = '#menu';
    if (step === 2) selector = '#tour-first-add-btn';
    if (step === 3) selector = '#tour-cart-btn';
    if (step === 4) selector = '#tour-checkout-btn';
    if (step === 5) selector = '#nombre';
    if (step === 6) selector = '#tour-payment-selector';
    if (step === 7) selector = '#tour-submit-order-btn';

    if (selector) {
      setTimeout(() => {
        const el = document.querySelector(selector);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, (step === 4 || step === 5) ? 350 : 100);
    }
  }, [step, isOpen]);

  useEffect(() => {
    if (!isOpen || step === -1) return;

    const updateRect = () => {
      let selector = '';
      if (step === 2) selector = '#tour-first-add-btn';
      if (step === 3) selector = '#tour-cart-btn';
      if (step === 4) selector = '#tour-checkout-btn';
      if (step === 5) selector = '#nombre';
      if (step === 6) selector = '#tour-payment-selector';
      if (step === 7) selector = '#tour-submit-order-btn';

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
      setStep(3);
    } else if (step === 3) {
      // Open the cart drawer
      if (openCart) openCart();
      setTimeout(() => {
        setStep(4);
      }, 300);
    } else if (step === 4) {
      // Open the checkout modal
      if (openCheckout) openCheckout();
      setTimeout(() => {
        setStep(5);
      }, 300);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      setStep(7);
    } else if (step === 7) {
      completeTour();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      if (step === 5) {
        // Going back from modal to cart drawer: close checkout and open cart
        if (closeCheckout) closeCheckout();
        if (openCart) openCart();
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
      desc: "Te enseñamos cómo realizar tus pedidos paso a paso para que tu compra sea rápida y segura.",
      btnText: "Iniciar Guía 🚀",
      showProgress: false
    },
    {
      title: "📜 Paso 1: Explora el Menú",
      desc: "Desliza hacia abajo o selecciona las categorías para explorar todas nuestras hamburguesas, perros, salchipapas y combos.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "🛒 Paso 2: Agrega al Pedido",
      desc: "Haz clic en 'Agregar al Pedido' en tu plato favorito para guardarlo en tu carrito de compras.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "🛍️ Paso 3: Abre el Carrito",
      desc: "Haz clic en el icono del carrito en la barra superior para abrir el resumen de tus artículos.",
      btnText: "Abrir Carrito",
      showProgress: true
    },
    {
      title: "📋 Paso 4: Confirma tu Pedido",
      desc: "Presiona el botón de 'Confirmar Pedido' al final del carrito para abrir la pantalla de entrega.",
      btnText: "Confirmar Pedido",
      showProgress: true
    },
    {
      title: "👤 Paso 5: Ingresa tus Datos",
      desc: "Escribe tu Nombre, Teléfono y Dirección de entrega en el formulario que aparece en pantalla.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "💳 Paso 6: Elige el Pago",
      desc: "Selecciona Pago en Efectivo o Pago por Llave (Transfiya) para realizar una transferencia segura.",
      btnText: "Siguiente Paso",
      showProgress: true
    },
    {
      title: "📞 Paso 7: Envía por WhatsApp",
      desc: "Haz clic en el botón verde final para enviar el pedido. Se abrirá tu WhatsApp con el mensaje ya escrito para que lo envíes con un solo toque.",
      btnText: "¡Listo, a pedir! 🎉",
      showProgress: true
    }
  ];

  const currentContent = stepsContent[step];

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
          top: '100px',
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

    const viewportHeight = window.innerHeight;
    const elementCenterY = rect.top + rect.height / 2;
    const isUpperHalf = elementCenterY < viewportHeight / 2;

    const tooltipStyle = {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '320px',
      zIndex: 100002
    };

    if (isUpperHalf) {
      tooltipStyle.bottom = '80px';
    } else {
      tooltipStyle.top = '100px';
    }

    const pointerStyle = {
      position: 'fixed',
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)',
      fontSize: '3.5rem',
      zIndex: 100002
    };

    let emoji = '👇';
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
      <div className="onboarding-overlay" />

      {step > 0 && (
        <div className="onboarding-pointer" style={layout.pointerStyle}>
          {layout.emoji}
        </div>
      )}

      <div className="onboarding-tooltip glassmorphic" style={layout.tooltipStyle}>
        <button className="onboarding-close-btn" onClick={completeTour} title="Saltar guía">
          <X size={16} />
        </button>

        <h4 className="onboarding-title">{currentContent.title}</h4>
        <p className="onboarding-desc">{currentContent.desc}</p>

        {currentContent.showProgress && (
          <div className="onboarding-progress">
            <div className="onboarding-progress-dots">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <span key={s} className={`progress-dot ${step === s ? 'active' : ''}`} />
              ))}
            </div>
            <span className="onboarding-step-num">Paso {step} de 7</span>
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
            {step < 6 && <ArrowRight size={14} style={{ marginLeft: '4px' }} />}
          </button>
        </div>
      </div>
    </>
  );
}
