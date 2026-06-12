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

    const message = `¡Hola, L'Ambroisie! 🍽️✨
Quisiera realizar el siguiente pedido a domicilio:

*Detalles del Pedido:*
${itemsText}

*Total a Pagar:* ${formatPrice(total)}

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
