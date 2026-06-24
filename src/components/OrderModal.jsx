import React, { useState, useEffect, useRef } from 'react';
import { X, Send, CheckCircle2, Copy, Check } from 'lucide-react';

const WHATSAPP_NUMBER = '573126602583';

const NEIGHBORHOODS = [
  { name: 'El Jardín / Alrededores', price: 4000 },
  { name: 'La Horquilla / Zona Kenedy', price: 4000 },
  { name: 'Los Ángeles / Pacific', price: 4000 },
  { name: 'Medrano', price: 5000 },
  { name: 'El Porvenir', price: 6000 },
  { name: 'La Yesquita / Yesca Grande', price: 6000 },
  { name: 'Zona Centro (Plaza de Mercado / Catedral)', price: 7000 },
  { name: 'Cabí / Alameda', price: 8000 },
  { name: 'El Reposo', price: 8000 },
  { name: 'Huapango Extremo', price: 8000 },
  { name: 'Otro barrio / Afueras (A convenir)', price: 8000 }
];

export default function OrderModal({ isOpen, onClose, cartItems, clearCart, onPlaceOrder }) {
  const [activeModalHint, setActiveModalHint] = useState('details');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); // efectivo, transfiya, mixto
  const displayPaymentNote = paymentMethod === 'transfiya' || paymentMethod === 'mixto';
  const [deliveryMethod, setDeliveryMethod] = useState('domicilio'); // domicilio, local
  const [barrio, setBarrio] = useState('El Jardín / Alrededores');
  const [copiedText, setCopiedText] = useState('');

  const [showTransferReminder, setShowTransferReminder] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const [gpsCoords, setGpsCoords] = useState(null); // { lat, lng }
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);
  const [mapAddressLoading, setMapAddressLoading] = useState(false);
  const [tempCoords, setTempCoords] = useState(null);
  const [tempAddress, setTempAddress] = useState('');
  const [forceMapInit, setForceMapInit] = useState(0);
  const mapInstanceRef = useRef(null);

  // Load Leaflet dynamically when map is opened
  useEffect(() => {
    if (!isMapOpen) return;
    if (window.L) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.onload = () => {
      setForceMapInit(prev => prev + 1);
    };
    document.body.appendChild(script);
  }, [isMapOpen]);

  // Map Initialization Effect
  useEffect(() => {
    if (!isMapOpen || !window.L) return;

    const timer = setTimeout(() => {
      const defaultCenter = [5.69188, -76.65825]; // Quibdó
      
      const map = window.L.map('map-leaflet-mount', {
        zoomControl: false,
        attributionControl: false
      }).setView(defaultCenter, 15);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      const handleMapMove = async () => {
        const center = map.getCenter();
        const coords = { lat: center.lat, lng: center.lng };
        setTempCoords(coords);
        
        setMapAddressLoading(true);
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'RapidoDeliRestaurante/1.0' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            const addressParts = data.address;
            const road = addressParts.road || addressParts.pedestrian || '';
            const house = addressParts.house_number || '';
            const neighbourhood = addressParts.neighbourhood || addressParts.suburb || addressParts.residential || '';
            const simplified = `${road} ${house}${neighbourhood ? `, Barrio ${neighbourhood}` : ''}`.trim() || data.display_name;
            setTempAddress(simplified);
          } else {
            setTempAddress(`${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`);
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setTempAddress(`${center.lat.toFixed(5)}, ${center.lng.toFixed(5)}`);
        } finally {
          setMapAddressLoading(false);
        }
      };

      map.on('moveend', handleMapMove);
      handleMapMove();

      // Autodetect GPS to center map on load
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 17);
          },
          (err) => {
            console.warn("Initial map GPS centering skipped:", err);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isMapOpen, forceMapInit]);

  const recenterMapOnUserGps = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapInstanceRef.current.setView([latitude, longitude], 17);
      },
      (err) => {
        alert("No se pudo obtener tu ubicación actual.");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const confirmMapSelection = () => {
    if (tempCoords) {
      setGpsCoords(tempCoords);
      setFormData(prev => ({ ...prev, direccion: tempAddress }));
      setIsMapOpen(false);
      setActiveModalHint('payment');
    }
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no es soportada por tu navegador.');
      return;
    }

    setIsLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
            headers: { 'User-Agent': 'RapidoDeliRestaurante/1.0' }
          });
          const data = await res.json();
          if (data && data.display_name) {
            const addressParts = data.address;
            const road = addressParts.road || addressParts.pedestrian || '';
            const house = addressParts.house_number || '';
            const neighbourhood = addressParts.neighbourhood || addressParts.suburb || addressParts.residential || '';
            const simplified = `${road} ${house}${neighbourhood ? `, Barrio ${neighbourhood}` : ''}`.trim() || data.display_name;
            setFormData(prev => ({ ...prev, direccion: simplified }));
          } else {
            setFormData(prev => ({ ...prev, direccion: `Ubicación GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})` }));
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setFormData(prev => ({ ...prev, direccion: `Ubicación GPS (${latitude.toFixed(5)}, ${longitude.toFixed(5)})` }));
        } finally {
          setIsLoadingGps(false);
          setActiveModalHint('payment');
        }
      },
      (error) => {
        console.warn("Geolocation error:", error);
        alert('No se pudo acceder a tu ubicación GPS. Por favor, asegúrate de dar permisos de ubicación o escribe tu dirección manualmente.');
        setIsLoadingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Handle countdown for transfer payment reminder
  useEffect(() => {
    let timer;
    if (showTransferReminder && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (showTransferReminder && countdown === 0) {
      handleFinalSubmit();
    }
    return () => clearTimeout(timer);
  }, [showTransferReminder, countdown]);

  // Auto-fill delivery address if local pickup is selected
  useEffect(() => {
    if (deliveryMethod === 'local') {
      setFormData(prev => ({ ...prev, direccion: 'Recoge en Local' }));
    } else if (formData.direccion === 'Recoge en Local') {
      setFormData(prev => ({ ...prev, direccion: '' }));
    }
  }, [deliveryMethod]);

  if (!isOpen) return null;

  const handleCopy = (textToCopy, field) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(field);
    setTimeout(() => {
      setCopiedText('');
    }, 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const selectedNeighborhood = NEIGHBORHOODS.find(n => n.name === barrio);
  const deliveryFee = deliveryMethod === 'domicilio'
    ? (selectedNeighborhood ? selectedNeighborhood.price : 4000)
    : 0;

  const finalTotal = subtotal + deliveryFee;

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    if (deliveryMethod === 'domicilio' && (!formData.direccion.trim() || formData.direccion === 'Recoge en Local')) {
      newErrors.direccion = 'La dirección de entrega es obligatoria';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  function handleFinalSubmit() {
    setShowTransferReminder(false);

    const itemsText = cartItems
      .map((item) => {
        const saucesStr = item.sauces && item.sauces.length > 0 ? ` (Salsas: ${item.sauces.join(', ')})` : '';
        return `• *${item.name}*${saucesStr} x${item.quantity} - _${formatPrice(item.price * item.quantity)}_`;
      })
      .join('\n');

    const cleanPhone = formData.telefono.replace(/\D/g, '');

    const deliveryDetail = deliveryMethod === 'domicilio'
      ? `🏍️ *Entrega a Domicilio* (Barrio: ${barrio} - Domicilio: ${formatPrice(deliveryFee)})`
      : `🏬 *Recoger en Local* (Sin costo de envío)`;

    const message = `¡Hola, Rápido & Deli! 🍔🍟🥤
Quisiera realizar el siguiente pedido:

*Detalles del Pedido:*
${itemsText}

*Desglose de Pago:*
• Subtotal: ${formatPrice(subtotal)}
• Envío: ${formatPrice(deliveryFee)}
• *Total a Pagar:* ${formatPrice(finalTotal)}

*Método de Pago:* ${paymentMethod === 'transfiya' ? 'Pago por Llave / Transfiya (Comprobante adjunto)' : paymentMethod === 'mixto' ? 'Pago Mixto (Llave + Efectivo)' : 'Efectivo (Contra entrega)'}

*Método de Entrega:*
${deliveryDetail}

*Datos del Cliente:*
👤 *Nombre:* ${formData.nombre}
📞 *Teléfono:* ${cleanPhone}
${deliveryMethod === 'domicilio' ? `📍 *Dirección:* ${formData.direccion}${gpsCoords ? `\n🗺️ *Ubicación GPS:* https://www.google.com/maps?q=${gpsCoords.lat},${gpsCoords.lng}` : ''}` : ''}

Quedo atento a su confirmación. ¡Muchas gracias!`;

    // Save order details to database
    if (onPlaceOrder) {
      const orderData = {
        items: cartItems.map((item) => ({
          id: item.id || '',
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          sauces: item.sauces || []
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: finalTotal,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        deliveryZone: deliveryMethod === 'domicilio' ? barrio : '',
        clientName: formData.nombre,
        clientPhone: cleanPhone,
        clientAddress: deliveryMethod === 'domicilio' ? formData.direccion : 'Recoge en Local',
        latitude: deliveryMethod === 'domicilio' && gpsCoords ? gpsCoords.lat : null,
        longitude: deliveryMethod === 'domicilio' && gpsCoords ? gpsCoords.lng : null,
        status: 'pendiente'
      };
      onPlaceOrder(orderData);
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Attempt window.open first, fallback to redirect if blocked
    const newWindow = window.open(whatsappUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      window.location.href = whatsappUrl;
    }
    
    setIsSuccess(true);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (paymentMethod === 'transfiya' || paymentMethod === 'mixto') {
      setShowTransferReminder(true);
      setCountdown(10); // Start 10 second countdown
    } else {
      handleFinalSubmit();
    }
  };

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    clearCart();
    onClose();
  };

  if (showTransferReminder) {
    return (
      <div className="modal-overlay">
        <div className="modal-content animate-slide-up" style={{ textAlign: 'center', padding: '32px 24px', maxWidth: '440px' }}>
          <div className="warning-icon-wrapper animate-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent-gold)' }}>
            <span style={{ fontSize: '4rem' }}>⚠️</span>
          </div>
          
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
            Recordatorio de Pago
          </h3>
          
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Recuerda hacer la transferencia y enviar o adjuntar al WhatsApp el recibo del pago.
          </p>

          <button
            onClick={handleFinalSubmit}
            className="btn btn-primary"
            style={{ width: '100%', marginBottom: '14px', minHeight: '48px', fontWeight: '600' }}
          >
            Enviar al WhatsApp
          </button>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Redirigiendo automáticamente en <strong style={{ color: 'var(--accent-gold)' }}>{countdown}</strong> segundos...
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="modal-overlay">
        <div className="modal-content animate-slide-up" style={{ textAlign: 'center', padding: '32px 24px', maxWidth: '440px' }}>
          <div className="success-icon-wrapper animate-bounce" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: '#25D366' }}>
            <CheckCircle2 size={64} />
          </div>
          
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>
            ¡Tu pedido está en camino!
          </h3>
          
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px' }}>
            Hemos abierto WhatsApp para que envíes el mensaje de confirmación al restaurante.
          </p>

          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', width: '100%', marginBottom: '24px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>Resumen del Pago:</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
              <span>Subtotal:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
              <span>Costo de Envío:</span>
              <span>{formatPrice(deliveryFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
              <span>Total a Pagar:</span>
              <span className="text-gold">{formatPrice(finalTotal)}</span>
            </div>
            {displayPaymentNote && (
              <div style={{ marginTop: '12px', padding: '10px', backgroundColor: 'rgba(37, 211, 102, 0.08)', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-primary)', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
                <strong>Nota:</strong> No olvides enviar el soporte de pago por Llave al chat de WhatsApp.
              </div>
            )}
          </div>

          {/* Venta Cruzada / Pedir Algo Más */}
          <div style={{ padding: '16px', borderRadius: '12px', border: '1.5px solid var(--accent-gold)', backgroundColor: 'var(--accent-gold-light)', width: '100%', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.2rem', display: 'block', marginBottom: '4px' }}>😋 ¿Te quedaste con antojo?</span>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              ¿Quieres pedir algo más para acompañar?
            </p>
            <button
              onClick={handleCloseSuccess}
              className="btn btn-primary btn-sm"
              style={{ width: '100%' }}
            >
              Volver al Catálogo
            </button>
          </div>

          <button
            onClick={handleCloseSuccess}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Cerrar Resumen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '440px', padding: '24px' }}>
        <button onClick={onClose} className="modal-close-btn" aria-label="Cerrar" style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <X size={20} />
        </button>
        <h3 className="modal-title" style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-primary)' }}>
          📍 Confirmar Datos de Entrega
        </h3>
        <p className="modal-subtitle" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Por favor ingresa tus datos. Al confirmar, abrirás tu WhatsApp para enviar el pedido.
        </p>

        <form id="tour-client-form" onSubmit={handleSubmit}>
          {/* Name Input */}
          <div 
            className="form-group" 
            style={{ marginBottom: '14px', position: 'relative' }}
            onClick={() => setActiveModalHint('details')}
          >
            {activeModalHint === 'details' && (
              <div className="flow-hint-bubble tooltip-top" style={{ bottom: 'calc(100% + 8px)' }}>
                <span className="flow-hint-hand">👇</span>
                <span>Completa tus datos de envío</span>
              </div>
            )}
            <label className="form-label" htmlFor="nombre" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Nombre Completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              onFocus={() => setActiveModalHint('details')}
              onBlur={() => {
                if (formData.nombre.trim() && formData.telefono.trim()) {
                  setActiveModalHint('delivery');
                }
              }}
              className="form-control"
              placeholder="Ej: Sharli Gómez"
              style={{ marginTop: '4px' }}
            />
            {errors.nombre && <p className="form-error">{errors.nombre}</p>}
          </div>

          {/* Phone Input */}
          <div 
            className="form-group" 
            style={{ marginBottom: '14px' }}
            onClick={() => setActiveModalHint('details')}
          >
            <label className="form-label" htmlFor="telefono" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Número de Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onFocus={() => setActiveModalHint('details')}
              onBlur={() => {
                if (formData.nombre.trim() && formData.telefono.trim()) {
                  setActiveModalHint('delivery');
                }
              }}
              className="form-control"
              placeholder="Ej: 3126602583"
              style={{ marginTop: '4px' }}
            />
            {errors.telefono && <p className="form-error">{errors.telefono}</p>}
          </div>

          {/* Delivery Method Selector */}
          <div 
            className="form-group" 
            style={{ marginBottom: '14px', position: 'relative' }}
            onClick={() => setActiveModalHint('delivery')}
          >
            {activeModalHint === 'delivery' && (
              <div className="flow-hint-bubble tooltip-bottom">
                <span className="flow-hint-hand">👆</span>
                <span>Selecciona cómo recibir tu pedido</span>
              </div>
            )}
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Método de Entrega</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className={`delivery-method-btn ${deliveryMethod === 'domicilio' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeliveryMethod('domicilio');
                  setActiveModalHint('neighborhood');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: deliveryMethod === 'domicilio' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  backgroundColor: deliveryMethod === 'domicilio' ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🏍️</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Domicilio</span>
              </button>
              <button
                type="button"
                className={`delivery-method-btn ${deliveryMethod === 'local' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setDeliveryMethod('local');
                  setActiveModalHint('payment');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 6px',
                  borderRadius: '10px',
                  border: deliveryMethod === 'local' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  backgroundColor: deliveryMethod === 'local' ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🏬</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Recoger en Local</span>
              </button>
            </div>
          </div>

          {/* Neighborhood Selector */}
          {deliveryMethod === 'domicilio' && (
            <div 
              className="form-group" 
              style={{ marginBottom: '14px', position: 'relative' }}
              onClick={() => setActiveModalHint('neighborhood')}
            >
              {activeModalHint === 'neighborhood' && (
                <div className="flow-hint-bubble tooltip-top" style={{ bottom: 'calc(100% + 8px)' }}>
                  <span className="flow-hint-hand">👇</span>
                  <span>Selecciona tu barrio</span>
                </div>
              )}
              <label className="form-label" htmlFor="barrio" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Barrio en Quibdó (Domicilio)</label>
              <select
                id="barrio"
                name="barrio"
                value={barrio}
                onChange={(e) => {
                  setBarrio(e.target.value);
                  if (activeModalHint === 'neighborhood') {
                    setActiveModalHint('address');
                  }
                }}
                onFocus={() => setActiveModalHint('neighborhood')}
                className="form-control"
                style={{ marginTop: '4px', cursor: 'pointer' }}
              >
                {NEIGHBORHOODS.map(n => (
                  <option key={n.name} value={n.name}>
                    {n.name} (+{formatPrice(n.price)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Delivery Address Input */}
          {deliveryMethod === 'domicilio' && (
            <div 
              className="form-group" 
              style={{ marginBottom: '14px', position: 'relative' }}
              onClick={() => setActiveModalHint('address')}
            >
              {activeModalHint === 'address' && (
                <div className="flow-hint-bubble tooltip-top" style={{ bottom: 'calc(100% + 8px)' }}>
                  <span className="flow-hint-hand">👇</span>
                  <span>Ingresa la dirección de entrega</span>
                </div>
              )}
              <label className="form-label" htmlFor="direccion" style={{ fontSize: '0.85rem', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '6px' }}>
                <span>Dirección de Entrega</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleUseGps}
                    className="pos-tactile-btn"
                    disabled={isLoadingGps}
                    style={{
                      height: '28px',
                      padding: '0 8px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--accent-gold-light)',
                      border: '1px solid var(--accent-gold)',
                      borderRadius: '6px',
                      color: 'var(--accent-gold)',
                      textTransform: 'none',
                      boxShadow: 'none'
                    }}
                  >
                    <span>{isLoadingGps ? '🔄 GPS...' : '📍 GPS Rápido'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(true)}
                    className="pos-tactile-btn"
                    style={{
                      height: '28px',
                      padding: '0 8px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'var(--accent-gold-light)',
                      border: '1px solid var(--accent-gold)',
                      borderRadius: '6px',
                      color: 'var(--accent-gold)',
                      textTransform: 'none',
                      boxShadow: 'none'
                    }}
                  >
                    <span>🗺️ Ver Mapa</span>
                  </button>
                </div>
              </label>
              <textarea
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                onFocus={() => setActiveModalHint('address')}
                onBlur={() => {
                  if (formData.direccion.trim()) {
                    setActiveModalHint('payment');
                  }
                }}
                className="form-control"
                rows="2"
                placeholder="Ej: Calle 24 # 3-12, frente al parque"
                style={{ marginTop: '4px', resize: 'none' }}
              ></textarea>
              {errors.direccion && <p className="form-error">{errors.direccion}</p>}
            </div>
          )}

          {/* Payment Method Selector */}
          <div 
            className="form-group" 
            style={{ marginBottom: '14px', position: 'relative' }}
            onClick={() => setActiveModalHint('payment')}
          >
            {activeModalHint === 'payment' && (
              <div className="flow-hint-bubble tooltip-bottom">
                <span className="flow-hint-hand">👆</span>
                <span>Elige tu método de pago</span>
              </div>
            )}
            <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Método de Pago</label>
            <div id="tour-payment-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'efectivo' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentMethod('efectivo');
                  setActiveModalHint('submit');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: '10px',
                  border: paymentMethod === 'efectivo' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'efectivo' ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>💵</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Efectivo</span>
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'transfiya' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentMethod('transfiya');
                  setActiveModalHint('copy_number');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: '10px',
                  border: paymentMethod === 'transfiya' ? '2px solid #25D366' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'transfiya' ? 'rgba(37, 211, 102, 0.08)' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>💳</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Llave</span>
              </button>
              <button
                type="button"
                className={`payment-method-btn ${paymentMethod === 'mixto' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setPaymentMethod('mixto');
                  setActiveModalHint('copy_number');
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 4px',
                  borderRadius: '10px',
                  border: paymentMethod === 'mixto' ? '2px solid #3498db' : '1px solid var(--border-color)',
                  backgroundColor: paymentMethod === 'mixto' ? 'rgba(52, 152, 219, 0.08)' : 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  gap: '2px'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>🔄</span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>Mixto</span>
              </button>
            </div>
          </div>

          {/* Transfiya Instructions Box */}
          {(paymentMethod === 'transfiya' || paymentMethod === 'mixto') && (
            <div 
              onClick={() => setActiveModalHint('copy_number')}
              style={{ padding: '12px', backgroundColor: 'rgba(37, 211, 102, 0.04)', border: '1px solid rgba(37, 211, 102, 0.2)', borderRadius: '10px', marginBottom: '14px' }}
            >
              <p style={{ fontSize: '0.78rem', margin: '0 0 6px 0', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                {paymentMethod === 'mixto'
                  ? <>Transfiere la parte acordada por <strong>Transfiya / Nequi</strong> al número del local y el resto en efectivo. Recuerda enviar el comprobante.</>
                  : <>Transfiere por <strong>Transfiya / Nequi / Daviplata</strong> al número del local. Recuerda enviar la captura de pantalla del comprobante.</>
                }
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>312 660 2583</span>
                <div style={{ position: 'relative' }}>
                  {activeModalHint === 'copy_number' && (
                    <div className="flow-hint-bubble tooltip-bottom">
                      <span className="flow-hint-hand">👆</span>
                      <span>Copia el número</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy('3126602583', 'phone');
                      setActiveModalHint('submit');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: copiedText === 'phone' ? 'var(--success)' : 'var(--accent-gold)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {copiedText === 'phone' ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedText === 'phone' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Total Breakdown and Submit */}
          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>Domicilio:</span>
                <span>{formatPrice(deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '700', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '2px' }}>
                <span>Total Final:</span>
                <span className="text-gold">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div 
              style={{ 
                position: 'relative', 
                width: '100%',
                marginTop: activeModalHint === 'submit' ? '55px' : '0px',
                transition: 'margin-top 0.3s ease'
              }}
            >
              {activeModalHint === 'submit' && (
                <div className="flow-hint-bubble tooltip-top" style={{ bottom: 'calc(100% + 10px)' }}>
                  <span className="flow-hint-hand">👇</span>
                  <span>Envía tu pedido por WhatsApp</span>
                </div>
              )}
              <button
                type="submit"
                id="tour-submit-order-btn"
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', minHeight: '48px', fontSize: '0.95rem' }}
              >
                <Send size={18} />
                Confirmar y Pedir por WhatsApp
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Map modal overlay rendered as absolute layer outside the main modal contents */}
      {isMapOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content animate-slide-up" style={{ 
            maxWidth: '680px', 
            width: '100%', 
            height: '90vh', 
            maxHeight: '90vh', 
            display: 'flex', 
            flexDirection: 'column',
            padding: '0',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* Map Header */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="modal-title" style={{ margin: 0, fontSize: '1.15rem' }}>Selecciona tu ubicación</h3>
                <p className="modal-subtitle" style={{ margin: '2px 0 0', fontSize: '0.78rem' }}>Mueve el mapa para centrar el pin en tu casa</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsMapOpen(false)} 
                className="btn-icon-round"
                style={{ width: '32px', height: '32px', position: 'absolute', top: '14px', right: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Map Container Wrapper */}
            <div style={{ flexGrow: 1, position: 'relative', width: '100%', backgroundColor: 'var(--bg-tertiary)' }}>
              {/* Leaflet Mount Container */}
              <div id="map-leaflet-mount" style={{ width: '100%', height: '100%' }}></div>

              {/* Uber-style Fixed Center Pin Overlay */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'none',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                {/* SVG Marker Pin */}
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" 
                        fill="var(--accent-gold)" 
                        stroke="#000" 
                        strokeWidth="1.5"
                  />
                </svg>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  marginTop: '-3px',
                  boxShadow: '0 0 3px rgba(0,0,0,0.5)'
                }}></div>
              </div>

              {/* Floating Controls (GPS Centering) */}
              <button
                type="button"
                onClick={recenterMapOnUserGps}
                className="pos-tactile-btn"
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  zIndex: 1000,
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)',
                  padding: 0
                }}
                title="Centrar en mi ubicación"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="8"/>
                  <line x1="12" y1="1" x2="12" y2="4"/>
                  <line x1="12" y1="20" x2="12" y2="23"/>
                  <line x1="1" y1="12" x2="4" y2="12"/>
                  <line x1="20" y1="12" x2="23" y2="12"/>
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </button>
            </div>

            {/* Map Footer (Address preview and Confirmation) */}
            <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '12px', textAlign: 'left' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                  Dirección Detectada:
                </span>
                <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-primary)', minHeight: '20px', fontWeight: '500', lineHeight: '1.3' }}>
                  {mapAddressLoading ? '🔄 Obteniendo dirección...' : tempAddress || 'Desplaza el mapa para ubicar tu casa'}
                </p>
              </div>
              
              <button
                type="button"
                onClick={confirmMapSelection}
                className="pos-tactile-btn primary"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem', textTransform: 'none' }}
                disabled={mapAddressLoading || !tempCoords}
              >
                📍 Confirmar esta Ubicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
