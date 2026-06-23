import React, { useState, useEffect } from 'react';

export default function CelebrationIntro({ theme }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!theme || theme === 'normal') {
      setVisible(false);
      return;
    }
    
    // Trigger pop-up on theme change/page load
    setVisible(true);
    
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3200); // visible for ~3 seconds

    return () => clearTimeout(timer);
  }, [theme]);

  if (!theme || theme === 'normal' || !visible) return null;

  const getIntroDetails = () => {
    switch (theme) {
      case 'soccer':
        return {
          title: '¡VIVE EL MUNDIAL!',
          subtitle: 'Fútbol, amigos y el mejor sabor en Rápido & Deli ⚽🔥',
          icon: '⚽',
          color: '#16a34a'
        };
      case 'champions':
        return {
          title: '¡NOCHES DE CHAMPIONS!',
          subtitle: 'Disfruta cada partido bajo las estrellas de la gloria 🏆⭐',
          icon: '🏆',
          color: '#1e3a8a'
        };
      case 'christmas':
        return {
          title: '¡FELIZ NAVIDAD!',
          subtitle: 'Celebrando la unión, el amor y el sabor más deli 🎄🎁',
          icon: '🎅',
          color: '#dc2626'
        };
      case 'halloween':
        return {
          title: '¡SABOR DE MIEDO!',
          subtitle: '¿Dulce o truco? Disfruta nuestras delicias de terror 🎃💀',
          icon: '👻',
          color: '#ea580c'
        };
      case 'valentine':
        return {
          title: '¡SÉ MI VALENTÍN!',
          subtitle: 'Comparte el amor y el sabor más deli de Quibdó 💖🌹',
          icon: '💕',
          color: '#ec4899'
        };
      case 'mothers':
        return {
          title: '¡FELIZ DÍA DE LA MADRE!',
          subtitle: 'Consintiendo a la reina del hogar con todo el cariño 🌸🤱',
          icon: '🌷',
          color: '#f43f5e'
        };
      default:
        return null;
    }
  };

  const details = getIntroDetails();
  if (!details) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(10, 10, 9, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999, // floats above everything
      animation: 'fade-out-overlay 0.4s ease-in 2.8s forwards',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: `2px solid ${details.color}`,
        borderRadius: '24px',
        padding: '30px 40px',
        textAlign: 'center',
        boxShadow: `0 10px 45px rgba(0,0,0,0.5), 0 0 25px ${details.color}33`,
        maxWidth: '90%',
        width: '420px',
        animation: 'zoom-in-bounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both, slide-up-exit 0.5s ease-in 2.7s forwards',
      }}>
        <div style={{
          fontSize: '3.6rem',
          marginBottom: '16px',
          animation: 'wiggle 1s ease-in-out infinite alternate',
          display: 'inline-block'
        }}>
          {details.icon}
        </div>
        
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          letterSpacing: '1px',
          marginBottom: '8px',
          fontFamily: 'var(--font-serif)',
          textTransform: 'uppercase'
        }}>
          {details.title}
        </h2>
        
        <div style={{
          width: '50px',
          height: '3px',
          backgroundColor: details.color,
          margin: '0 auto 18px',
          borderRadius: '2px'
        }} />
        
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.98rem',
          fontWeight: '500',
          lineHeight: '1.4'
        }}>
          {details.subtitle}
        </p>
      </div>
    </div>
  );
}
