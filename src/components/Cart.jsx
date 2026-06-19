import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, CheckCircle2, Copy, Check } from 'lucide-react';

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

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  updateCartItemSauces,
  clearCart,
  onPlaceOrder
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo'); // efectivo, transfiya
  const [deliveryMethod, setDeliveryMethod] = useState('domicilio'); // domicilio, local
  const [barrio, setBarrio] = useState('El Jardín / Alrededores');
  const [copiedText, setCopiedText] = useState('');

  // Auto-fill delivery address if local pickup is selected
  useEffect(() => {
    if (deliveryMethod === 'local') {
      setFormData(prev => ({ ...prev, direccion: 'Recoge en Local' }));
    } else if (formData.direccion === 'Recoge en Local') {
      setFormData(prev => ({ ...prev, direccion: '' }));
    }
  }, [deliveryMethod]);

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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) {
      // Scroll to first error
      setTimeout(() => {
        const errorEl = document.querySelector('.form-error');
        if (errorEl) {
          errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

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

*Método de Pago:* ${paymentMethod === 'transfiya' ? 'Pago por Llave / Transfiya (Comprobante adjunto)' : 'Efectivo (Contra entrega)'}

*Método de Entrega:*
${deliveryDetail}

*Datos del Cliente:*
👤 *Nombre:* ${formData.nombre}
📞 *Teléfono:* ${cleanPhone}
${deliveryMethod === 'domicilio' ? `📍 *Dirección:* ${formData.direccion}` : ''}

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
        status: 'pendiente'
      };
      onPlaceOrder(orderData);
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setIsSuccess(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    // Reset form
    setFormData({ nombre: '', telefono: '', direccion: '' });
    setErrors({});
    setPaymentMethod('efectivo');
    setDeliveryMethod('domicilio');
    setBarrio('El Jardín / Alrededores');
    clearCart();
    onClose();
  };

  if (isSuccess) {
    return (
      <>
        <div className="cart-drawer-overlay" onClick={handleCloseSuccess}></div>
        <div className="cart-drawer">
          <div className="cart-header">
            <h2 className="cart-title">¡Pedido Enviado!</h2>
            <button onClick={handleCloseSuccess} className="btn-icon-round" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
          <div className="cart-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px 24px' }}>
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
              {paymentMethod === 'transfiya' && (
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
      </>
    );
  }

  return (
    <>
      {/* Background Overlay */}
      <div className="cart-drawer-overlay" onClick={onClose}></div>

      {/* Cart Drawer */}
      <div className="cart-drawer">
        <div className="cart-header">
          <h2 className="cart-title">Tu Pedido</h2>
          <button onClick={onClose} className="btn-icon-round" aria-label="Cerrar carrito">
            <X size={20} />
          </button>
        </div>

        <div className="cart-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty-message">
              <ShoppingBag size={48} className="text-gold" style={{ opacity: 0.5 }} />
              <p>Tu carrito está vacío</p>
              <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: '12px' }}>
                Explorar el Menú
              </button>
            </div>
          ) : (
            <>
              {/* Item Cards List */}
              <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cartItems.map((item) => (
                  <div key={item.cartKey} className="cart-item animate-slide-up" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', alignItems: 'flex-start' }}>
                    <img src={item.image} alt={item.name} className="cart-item-img" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                    
                    <div className="cart-item-info" style={{ flexGrow: 1 }}>
                      <h4 className="cart-item-name" style={{ fontSize: '0.92rem', fontWeight: '600', margin: 0 }}>{item.name}</h4>
                      
                      {/* Selected sauces */}
                      {(item.category === 'hamburguesas' || 
                        item.category === 'perros' || 
                        item.category === 'salchipapas') ? (
                          <div style={{ margin: '6px 0' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                              Salsas:
                            </span>
                            <div className="sauce-grid-cart">
                              {['Rosada', 'Roja', 'Tártara', 'Ajo', 'Piña', 'Mostaza'].map(sauce => {
                                const isChecked = item.sauces && item.sauces.includes(sauce);
                                return (
                                  <label 
                                    key={sauce} 
                                    className={`sauce-pill-cart ${isChecked ? 'active' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let newSauces = item.sauces ? [...item.sauces] : [];
                                        if (e.target.checked) {
                                          newSauces.push(sauce);
                                        } else {
                                          newSauces = newSauces.filter(s => s !== sauce);
                                        }
                                        updateCartItemSauces(item.cartKey, newSauces);
                                      }}
                                    />
                                    <span>{sauce}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                      ) : null}
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span className="cart-item-price" style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: '600' }}>{formatPrice(item.price)}</span>
                        
                        <div className="cart-item-actions">
                          <button
                            onClick={() => updateQuantity(item.cartKey, -1)}
                            className="quantity-btn"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus size={10} />
                          </button>
                          <span className="cart-item-quantity">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, 1)}
                            className="quantity-btn"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.cartKey)}
                      className="btn-remove-item"
                      title="Eliminar artículo"
                      aria-label="Eliminar artículo"
                      style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Delivery and Customer Form */}
              <div 
                className="cart-checkout-form animate-slide-up" 
                style={{ marginTop: '24px', borderTop: '2px solid var(--border-color)', paddingTop: '20px' }}
              >
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                  📍 Confirmar Datos de Entrega
                </h3>

                <form onSubmit={handleSubmit}>
                  {/* Name Input */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" htmlFor="nombre" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Nombre Completo</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Ej: Sharli Gómez"
                      style={{ marginTop: '4px' }}
                    />
                    {errors.nombre && <p className="form-error">{errors.nombre}</p>}
                  </div>

                  {/* Phone Input */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" htmlFor="telefono" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Número de Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Ej: 3126602583"
                      style={{ marginTop: '4px' }}
                    />
                    {errors.telefono && <p className="form-error">{errors.telefono}</p>}
                  </div>

                  {/* Delivery Method Selector */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Método de Entrega</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="button"
                        className={`delivery-method-btn ${deliveryMethod === 'domicilio' ? 'active' : ''}`}
                        onClick={() => setDeliveryMethod('domicilio')}
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
                        onClick={() => setDeliveryMethod('local')}
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
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" htmlFor="barrio" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Barrio en Quibdó (Domicilio)</label>
                      <select
                        id="barrio"
                        name="barrio"
                        value={barrio}
                        onChange={(e) => setBarrio(e.target.value)}
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
                    <div className="form-group" style={{ marginBottom: '14px' }}>
                      <label className="form-label" htmlFor="direccion" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Dirección de Entrega</label>
                      <textarea
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        className="form-control"
                        rows="2"
                        placeholder="Ej: Calle 24 # 3-12, frente al parque"
                        style={{ marginTop: '4px', resize: 'none' }}
                      ></textarea>
                      {errors.direccion && <p className="form-error">{errors.direccion}</p>}
                    </div>
                  )}

                  {/* Payment Method Selector */}
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label className="form-label" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Método de Pago</label>
                    <div id="tour-payment-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="button"
                        className={`payment-method-btn ${paymentMethod === 'efectivo' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('efectivo')}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 6px',
                          borderRadius: '10px',
                          border: paymentMethod === 'efectivo' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                          backgroundColor: paymentMethod === 'efectivo' ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          gap: '2px'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>💵</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Efectivo</span>
                      </button>
                      <button
                        type="button"
                        className={`payment-method-btn ${paymentMethod === 'transfiya' ? 'active' : ''}`}
                        onClick={() => setPaymentMethod('transfiya')}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px 6px',
                          borderRadius: '10px',
                          border: paymentMethod === 'transfiya' ? '2px solid #25D366' : '1px solid var(--border-color)',
                          backgroundColor: paymentMethod === 'transfiya' ? 'rgba(37, 211, 102, 0.08)' : 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          gap: '2px'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>💳</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>Llave (Transfiya)</span>
                      </button>
                    </div>
                  </div>

                  {/* Transfiya Instructions Box */}
                  {paymentMethod === 'transfiya' && (
                    <div style={{ padding: '12px', backgroundColor: 'rgba(37, 211, 102, 0.04)', border: '1px solid rgba(37, 211, 102, 0.2)', borderRadius: '10px', marginBottom: '14px' }}>
                      <p style={{ fontSize: '0.78rem', margin: '0 0 6px 0', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        Transfiere por <strong>Transfiya / Nequi / Daviplata</strong> al número del local. Recuerda enviar la captura de pantalla del comprobante.
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>312 660 2583</span>
                        <button
                          type="button"
                          onClick={() => handleCopy('3126602583', 'phone')}
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
                  )}
                </form>
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer animate-slide-up" style={{ borderTop: '2px solid var(--border-color)', padding: '16px 24px', backgroundColor: 'var(--bg-primary)' }}>
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
            
            <button
              onClick={handleSubmit}
              id="tour-submit-order-btn"
              className="btn btn-primary btn-checkout"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', minHeight: '48px', fontSize: '0.95rem' }}
            >
              <Send size={18} />
              Confirmar y Pedir por WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
