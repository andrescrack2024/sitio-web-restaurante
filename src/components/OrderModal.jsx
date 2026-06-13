import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

const WHATSAPP_NUMBER = '573126602583'; // Colombian country code + 57

export default function OrderModal({ isOpen, onClose, cartItems, clearCart }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    direccion: ''
  });
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
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

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!/^\+?[\d\s-]{7,15}$/.test(formData.telefono)) {
      newErrors.telefono = 'Formato de teléfono inválido';
    }
    if (!formData.direccion.trim()) newErrors.direccion = 'La dirección de entrega es obligatoria';
    
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
      .map((item) => `• *${item.name}* x${item.quantity} - _${formatPrice(item.price * item.quantity)}_`)
      .join('\n');

    const message = `¡Hola, Rápido & Deli! 🍔🍟🥤
Quisiera realizar el siguiente pedido a domicilio:

*Detalles del Pedido:*
${itemsText}

*Total a Pagar:* ${formatPrice(total)}
*Método de Pago:* ${paymentMethod === 'nequi' ? 'Nequi / Transferencia (Comprobante adjunto)' : 'Efectivo (Contra entrega)'}

*Datos de Entrega:*
👤 *Nombre:* ${formData.nombre}
📞 *Teléfono:* ${formData.telefono}
📍 *Dirección:* ${formData.direccion}

Quedo atento a su confirmación. ¡Muchas gracias!`;

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

            <form onSubmit={handleSubmit}>
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

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Método de Pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('efectivo')}
                    className={`btn ${paymentMethod === 'efectivo' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textTransform: 'none', letterSpacing: '0.5px', padding: '10px 14px', fontSize: '0.9rem', borderRadius: '8px' }}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nequi')}
                    className={`btn ${paymentMethod === 'nequi' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ 
                      textTransform: 'none', 
                      letterSpacing: '0.5px', 
                      padding: '10px 14px',
                      fontSize: '0.9rem',
                      borderRadius: '8px',
                      borderColor: paymentMethod === 'nequi' ? '#d4af37' : '',
                    }}
                  >
                    💳 Nequi / Cuenta Bancaria
                  </button>
                </div>
              </div>

              {paymentMethod === 'nequi' && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <div style={{
                      backgroundColor: '#e6007e',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.5px'
                    }}>
                      TRANSFERENCIA
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Instrucciones de Pago
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    {/* Sección Celular (Nequi / Daviplata / Transfiya) */}
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: '#e6007e', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Opción 1: Nequi / Daviplata / Transfiya
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Celular destino (Cualquier Banco)</span>
                          <strong style={{ fontSize: '1rem' }}>312 660 2583</strong>
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

                    {/* Sección Banco Alternativo (Ejemplo) */}
                    <div style={{ padding: '12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-gold)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                        Opción 2: Cuenta Bancaria (Ejemplo)
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Bancolombia • Ahorros</span>
                          <strong style={{ fontSize: '0.95rem' }}>507-123456-78</strong>
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleCopy('507-123456-78', 'cuenta')}
                          className="btn btn-secondary" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem', textTransform: 'none', borderRadius: '6px' }}
                        >
                          {copiedText === 'cuenta' ? '¡Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    {/* Valor a pagar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Valor exacto a transferir</span>
                        <strong style={{ fontSize: '1rem', color: 'var(--accent-gold)' }}>{formatPrice(total)}</strong>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleCopy(total.toString(), 'valor')}
                        className="btn btn-secondary" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', textTransform: 'none', borderRadius: '6px' }}
                      >
                        {copiedText === 'valor' ? '¡Copiado!' : 'Copiar'}
                      </button>
                    </div>

                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <a 
                      href="https://nequi.co" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn" 
                      style={{ 
                        width: '100%', 
                        padding: '10px', 
                        fontSize: '0.85rem', 
                        backgroundColor: '#1E1E24', 
                        color: 'white', 
                        borderColor: '#1E1E24',
                        textTransform: 'none',
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      🚀 Abrir App Nequi
                    </a>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center', lineHeight: '1.4' }}>
                      Realiza la transferencia desde tu banco o app Nequi. Toma una captura de pantalla del comprobante y adjúntala al enviar tu WhatsApp.
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
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
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
              Hemos abierto WhatsApp para enviar tu pedido al restaurante. 
              <br /><br />
              El dueño confirmará tu pedido en breve y te solicitará tu **ubicación en tiempo real** por el chat para realizar la entrega a domicilio.
            </p>
            <button onClick={handleCloseSuccess} className="btn btn-primary" style={{ width: '100%' }}>
              Volver al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
