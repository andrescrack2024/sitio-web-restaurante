import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

const WHATSAPP_NUMBER = '573126602583'; // Colombian country code + 57

export default function OrderModal({ isOpen, onClose, cartItems, clearCart, onPlaceOrder }) {
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
  const [deliveryZone, setDeliveryZone] = useState('cercano'); // cercano, medio, lejano
  const [copiedText, setCopiedText] = useState('');

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

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const deliveryFee = deliveryMethod === 'domicilio'
    ? (deliveryZone === 'cercano' ? 4000 : deliveryZone === 'medio' ? 6000 : 8000)
    : 0;

  const finalTotal = total + deliveryFee;

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    if (deliveryMethod === 'domicilio' && !formData.direccion.trim()) {
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
    e.preventDefault();
    if (!validate()) return;

    // Build the WhatsApp message template
    const itemsText = cartItems
      .map((item) => {
        const saucesStr = item.sauces && item.sauces.length > 0 ? ` (Salsas: ${item.sauces.join(', ')})` : '';
        return `• *${item.name}*${saucesStr} x${item.quantity} - _${formatPrice(item.price * item.quantity)}_`;
      })
      .join('\n');

    // Format client's phone number
    const cleanPhone = formData.telefono.replace(/\D/g, '');

    const deliveryDetail = deliveryMethod === 'domicilio'
      ? `🏍️ *Entrega a Domicilio* (Zona: ${deliveryZone === 'cercano' ? 'Cercana ($4.000)' : deliveryZone === 'medio' ? 'Media ($6.000)' : 'Lejana ($8.000)'})`
      : `🏬 *Recoger en Local* (Sin costo de envío)`;

    const message = `¡Hola, Rápido & Deli! 🍔🍟🥤
Quisiera realizar el siguiente pedido:

*Detalles del Pedido:*
${itemsText}

*Desglose de Pago:*
• Subtotal: ${formatPrice(total)}
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
        subtotal: total,
        deliveryFee: deliveryFee,
        total: finalTotal,
        paymentMethod: paymentMethod,
        deliveryMethod: deliveryMethod,
        deliveryZone: deliveryMethod === 'domicilio' ? deliveryZone : '',
        clientName: formData.nombre,
        clientPhone: cleanPhone,
        clientAddress: deliveryMethod === 'domicilio' ? formData.direccion : 'Recoge en Local',
        status: 'pendiente'
      };
      onPlaceOrder(orderData);
    }

    // Encode message for URL
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    // Show success view
    setIsSuccess(true);
  };

  const handleCloseSuccess = () => {
    clearCart();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up">
        {!isSuccess ? (
          <>
            <button onClick={onClose} className="modal-close-btn" aria-label="Cerrar">
              <X size={20} />
            </button>
            <h3 className="modal-title">Datos de Entrega</h3>
            <p className="modal-subtitle">
              Por favor, ingrese sus datos para finalizar el pedido. Al confirmar, será redirigido a WhatsApp para coordinar el envío.
            </p>

            <form id="tour-client-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">Nombre Completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ej: Sharli Gómez"
                />
                {errors.nombre && <p className="form-error">{errors.nombre}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="telefono">Número de Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ej: 3126602583"
                />
                {errors.telefono && <p className="form-error">{errors.telefono}</p>}
              </div>

              {/* Delivery Method Selector */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Método de Entrega</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="delivery-method-btn"
                    onClick={() => setDeliveryMethod('domicilio')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: deliveryMethod === 'domicilio' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      backgroundColor: deliveryMethod === 'domicilio' ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>🏍️</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Domicilio</span>
                  </button>
                  <button
                    type="button"
                    className="delivery-method-btn"
                    onClick={() => setDeliveryMethod('local')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: deliveryMethod === 'local' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      backgroundColor: deliveryMethod === 'local' ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>🏬</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Recoger en Local</span>
                  </button>
                </div>
              </div>

              {/* Delivery Zone Selector */}
              {deliveryMethod === 'domicilio' && (
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="deliveryZone">Zona de Envío</label>
                  <select
                    id="deliveryZone"
                    name="deliveryZone"
                    value={deliveryZone}
                    onChange={(e) => setDeliveryZone(e.target.value)}
                    className="form-control"
                    style={{ marginTop: '6px', cursor: 'pointer' }}
                  >
                    <option value="cercano">Casco Urbano / Cercano (+$4.000)</option>
                    <option value="medio">Barrios Alejados / Medio (+$6.000)</option>
                    <option value="lejano">Afueras / Lejano (+$8.000)</option>
                  </select>
                </div>
              )}

              {/* Address input */}
              {deliveryMethod === 'domicilio' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="direccion">Dirección de Entrega</label>
                  <textarea
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    className="form-control"
                    rows="3"
                    placeholder="Calle, carrera, apartamento, conjunto, barrio..."
                  ></textarea>
                  {errors.direccion && <p className="form-error">{errors.direccion}</p>}
                </div>
              )}

              {/* Payment Method Selector */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Método de Pago</label>
                <div id="tour-payment-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="payment-method-btn"
                    onClick={() => setPaymentMethod('efectivo')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: paymentMethod === 'efectivo' ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)',
                      backgroundColor: paymentMethod === 'efectivo' ? 'var(--accent-gold-light)' : 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>💵</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Pago en Efectivo</span>
                  </button>
                  <button
                    type="button"
                    className="payment-method-btn"
                    onClick={() => setPaymentMethod('transfiya')}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: paymentMethod === 'transfiya' ? '2px solid #25D366' : '1px solid var(--border-color)',
                      backgroundColor: paymentMethod === 'transfiya' ? 'rgba(37, 211, 102, 0.08)' : 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>💳</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Pago por Llave (Transfiya)</span>
                  </button>
                </div>
              </div>

              {/* Transfiya Instructions */}
              {paymentMethod === 'transfiya' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  marginTop: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                      backgroundColor: '#25D366',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      LLAVE / TRANSFIYA
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Enviar a Celular
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#25D366', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Número de Celular Destino
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Transfiya (Cualquier Banco / Nequi / Daviplata)</span>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>312 660 2583</strong>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleCopy('3126602583', 'celular')}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', textTransform: 'none', borderRadius: '6px' }}
                        >
                          {copiedText === 'celular' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Valor a pagar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Valor exacto a transferir</span>
                        <strong style={{ fontSize: '1rem', color: 'var(--accent-gold)' }}>{formatPrice(finalTotal)}</strong>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(finalTotal.toString(), 'valor')}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', textTransform: 'none', borderRadius: '6px' }}
                      >
                        {copiedText === 'valor' ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center', lineHeight: '1.4' }}>
                      Realiza la transferencia desde tu banco preferido usando Transfiya o envía directo al celular. Toma captura del comprobante y <strong>adjúntala en el chat de WhatsApp</strong> que se abrirá a continuación.
                    </span>
                  </div>
                </div>
              )}

              {/* Desglose de totales */}
              <div style={{
                padding: '16px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                marginBottom: '16px',
                marginTop: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatPrice(total)}</span>
                </div>
                {deliveryMethod === 'domicilio' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Costo Domicilio:</span>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{formatPrice(deliveryFee)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Total Final:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button id="tour-submit-order-btn" type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                Hacer Pedido por WhatsApp <Send size={18} style={{ marginLeft: '6px' }} />
              </button>
            </form>
          </>
        ) : (
          <div className="success-card">
            <div className="success-icon-wrapper">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '16px' }}>
              ¡Pedido Enviado!
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem', textAlign: 'center' }}>
              Hemos abierto WhatsApp para enviar tu pedido al restaurante. 
              <br /><br />
              El restaurante confirmará tu pedido en breve. Si seleccionaste domicilio, te solicitaremos tu **ubicación en tiempo real** para la entrega.
            </p>
            
            {/* Cross-selling box */}
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '600' }}>
                ¿Se te olvidó algo o quieres pedir algo más?
              </p>
              <button 
                onClick={() => {
                  clearCart();
                  onClose();
                  const menuSection = document.getElementById('menu');
                  if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-secondary" 
                style={{ width: '100%', textTransform: 'none', letterSpacing: '0.5px' }}
              >
                🍔 Sí, pedir algo más
              </button>
            </div>

            <button onClick={handleCloseSuccess} className="btn btn-primary" style={{ width: '100%' }}>
              Entendido / Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
