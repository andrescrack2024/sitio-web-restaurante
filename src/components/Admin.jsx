import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ArrowLeft, Save, X, Info } from 'lucide-react';
import { storage, isFirebaseSupported } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Admin({
  menuItems,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  orders = [],
  onUpdateOrderStatus,
  onDeleteOrder,
  onGoBack
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos' or 'menu'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'rapida',
    description: '',
    badge: '',
    image: ''
  });
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const compressAndReadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Web-Optimized JPEG (approx. 20KB - 50KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

        // Simulate upload progress for UI feedback
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += 25;
          setUploadProgress(currentProgress);
          if (currentProgress >= 100) {
            clearInterval(interval);
            setFormData((prev) => ({ ...prev, image: compressedBase64 }));
            setIsUploading(false);
            setUploadProgress(0);
          }
        }, 100);
      };
      img.onerror = () => {
        setIsUploading(false);
        alert("Error al procesar el archivo de imagen.");
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert("Error al leer el archivo.");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    compressAndReadImage(file);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'rapida': return 'Comida Rápida';
      case 'acompanamientos': return 'Acompañamientos';
      case 'helados': return 'Helados';
      case 'bebidas': return 'Bebidas';
      default: return cat;
    }
  };

  const printComanda = (order) => {
    const printWindow = window.open('', '_blank', 'width=600,height=600');
    if (!printWindow) {
      alert("Por favor, permite las ventanas emergentes (popups) para poder imprimir la comanda.");
      return;
    }
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 6px 0; font-size: 14px;">${item.quantity}x</td>
        <td style="padding: 6px 0; font-size: 14px;"><b>${item.name}</b></td>
        <td style="text-align: right; padding: 6px 0; font-size: 14px;">$${(item.price * item.quantity).toLocaleString('es-CO')}</td>
      </tr>
    `).join('');

    const dateFormatted = new Date(order.createdAt).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });

    const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';

    printWindow.document.write(`
      <html>
      <head>
        <title>Comanda - Pedido #${orderNum}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace;
            width: 76mm;
            margin: 0 auto;
            padding: 10px 5px;
            font-size: 13px;
            line-height: 1.4;
            color: #000;
          }
          .text-center { text-align: center; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .header { font-size: 18px; font-weight: bold; }
          .total { font-size: 15px; font-weight: bold; margin-top: 8px; }
          .badge { border: 2px solid #000; padding: 8px; font-weight: bold; text-align: center; font-size: 14px; margin-top: 12px; }
        </style>
      </head>
      <body>
        <div class="text-center header">CHOQUINBURGER</div>
        <div class="text-center">TICKET DE COCINA</div>
        <div class="divider"></div>
        <div><b>FECHA:</b> ${dateFormatted}</div>
        <div><b>PEDIDO:</b> #${orderNum}</div>
        <div class="divider"></div>
        <div><b>CLIENTE:</b> ${order.clientName}</div>
        <div><b>TELÉFONO:</b> ${order.clientPhone}</div>
        <div><b>DIRECCIÓN:</b> ${order.clientAddress}</div>
        <div class="divider"></div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <thead>
            <tr style="border-bottom: 1px solid #000;">
              <th align="left" style="padding-bottom: 4px;">Cant</th>
              <th align="left" style="padding-bottom: 4px;">Producto</th>
              <th align="right" style="padding-bottom: 4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="total" style="display: flex; justify-content: space-between;">
          <span>TOTAL:</span>
          <span>$${order.total.toLocaleString('es-CO')}</span>
        </div>
        <div class="divider"></div>
        <div><b>PAGO:</b> ${order.paymentMethod === 'nequi' ? '💳 TRANSFERENCIA' : '💵 EFECTIVO'}</div>
        <div class="badge">
          ${order.status === 'pendiente' && order.paymentMethod === 'nequi' 
            ? '⚠️ PAGO POR VERIFICAR (WhatsApp)' 
            : '⚠️ PEDIDO AUTORIZADO - COCINA'}
        </div>
        <div class="divider"></div>
        <div class="text-center" style="font-size: 11px;">¡A preparar con calidad y rapidez! 🍔🔥</div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sendStatusWhatsApp = (order) => {
    const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';
    let message = '';
    
    if (order.status === 'pendiente') {
      message = `¡Hola, ${order.clientName}! 🍔 Hemos recibido tu pedido #${orderNum} en Choquinburger. Estamos procesándolo y validándolo en nuestro sistema. ¡Muchas gracias por tu paciencia!`;
    } else if (order.status === 'en cocina') {
      message = `¡Hola, ${order.clientName}! 🍔 Tu pedido #${orderNum} ya está en la cocina y nuestros parrilleros lo están preparando con el mejor sabor de Choquinburger. 🔥 ¡Te avisaremos apenas vaya en camino!`;
    } else if (order.status === 'en camino') {
      message = `¡Hola, ${order.clientName}! 🛵 Tu pedido #${orderNum} de Choquinburger ya va en camino a tu dirección: ${order.clientAddress}. Nuestro repartidor llegará muy pronto. ¡Buen provecho!`;
    } else if (order.status === 'entregado') {
      message = `¡Hola, ${order.clientName}! 🎉 Tu pedido #${orderNum} de Choquinburger ha sido entregado con éxito. ¡Esperamos que disfrutes de tu comida! Agradecemos mucho tu compra y tu preferencia. 🍔🍟🥤`;
    } else if (order.status === 'cancelado') {
      message = `Hola, ${order.clientName}. Lamentamos informarte que tu pedido #${orderNum} de Choquinburger ha sido cancelado. Si tienes alguna duda, por favor comunícate con nosotros por esta línea.`;
    }
    
    // Format phone with Colombian country prefix if needed
    let phone = order.clientPhone.replace(/\D/g, '');
    if (phone.length === 10 && !phone.startsWith('57')) {
      phone = '57' + phone;
    }
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: 'rapida',
      description: '',
      badge: '',
      image: ''
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      badge: product.badge || '',
      image: product.image || ''
    });
    setErrors({});
    setIsFormOpen(true);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.price) {
      newErrors.price = 'El precio es obligatorio';
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = 'El precio debe ser un número mayor a 0';
    }
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';

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

    // Use default fallback image if none provided
    const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600';
    const finalProduct = {
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category,
      description: formData.description.trim(),
      badge: formData.badge.trim() || undefined,
      image: formData.image.trim() || defaultImage
    };

    if (editingProduct) {
      onUpdateProduct({ ...finalProduct, id: editingProduct.id });
    } else {
      onAddProduct(finalProduct);
    }
    
    setIsFormOpen(false);
  };

  const handleDeleteClick = (id, name) => {
    if (window.confirm(`¿Está seguro de que desea eliminar "${name}" del menú?`)) {
      onDeleteProduct(id);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta. Intente de nuevo.');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="admin-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90vh' }}>
        <div className="modal-content animate-slide-up" style={{ position: 'static', maxWidth: '400px', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
          <div className="success-icon-wrapper" style={{ backgroundColor: 'var(--accent-gold-light)', margin: '0 auto 20px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h3 className="modal-title" style={{ textAlign: 'center', marginBottom: '10px' }}>Acceso Restringido</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Ingrese la contraseña del administrador para gestionar el catálogo.
          </p>

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (loginError) setLoginError('');
                }}
                className="form-control"
                placeholder="Contraseña"
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px' }}
                required
                autoFocus
              />
              {loginError && <p className="form-error" style={{ textAlign: 'center', marginTop: '8px' }}>{loginError}</p>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '16px' }}>
              Ingresar al Panel
            </button>
          </form>
          
          <button onClick={onGoBack} className="btn btn-secondary" style={{ width: '100%', textTransform: 'none' }}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Regresar al Sitio
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-section">
      <div className="container">
        {/* Header Row */}
        <div className="admin-header-row animate-slide-up">
          <div className="admin-title-group">
            <h2 className="font-serif">Panel de Control</h2>
            <p>Gestión de pedidos en tiempo real y catálogo de platos del restaurante.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onGoBack} className="btn btn-secondary" style={{ textTransform: 'none' }}>
              <ArrowLeft size={16} /> Volver al Sitio
            </button>
            {activeTab === 'menu' && (
              <button onClick={openAddModal} className="btn btn-primary" style={{ textTransform: 'none' }}>
                <Plus size={16} /> Agregar Producto
              </button>
            )}
          </div>
        </div>

        {/* Tab Selector */}
        <div className="admin-tabs animate-slide-up" style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
          <button 
            type="button"
            onClick={() => setActiveTab('pedidos')} 
            className={`btn ${activeTab === 'pedidos' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'none', borderRadius: '8px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', border: activeTab !== 'pedidos' ? '1px solid var(--border-color)' : undefined }}
          >
            📋 Pedidos en Vivo ({orders.length})
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('menu')} 
            className={`btn ${activeTab === 'menu' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'none', borderRadius: '8px', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', border: activeTab !== 'menu' ? '1px solid var(--border-color)' : undefined }}
          >
            🍔 Gestionar Menú ({menuItems.length})
          </button>
        </div>

        {/* Info Box */}
        <div 
          className="animate-slide-up"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--accent-gold-light)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '0.95rem',
            textAlign: 'left'
          }}
        >
          <Info size={24} className="text-gold" style={{ flexShrink: 0 }} />
          {activeTab === 'pedidos' ? (
            <p>
              Aquí puedes ver los pedidos a domicilio entrantes en tiempo real. Utiliza el botón <b>Validar Transferencia</b> para confirmar pagos por Nequi/Bancolombia, o presiona <b>Imprimir Comanda</b> para generar el ticket físico para la cocina.
            </p>
          ) : (
            <p>
              Gestiona el catálogo de platos. Los cambios realizados aquí se sincronizan automáticamente con la base de datos de Firestore en la nube y se reflejan al instante en la carta digital del cliente.
            </p>
          )}
        </div>

        {activeTab === 'pedidos' ? (
          /* Pedidos en Vivo Grid list */
          <div className="orders-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {orders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                No hay pedidos registrados aún. Los pedidos en tiempo real de los clientes aparecerán aquí.
              </div>
            ) : (
              orders.map((order) => {
                const dateObj = new Date(order.createdAt);
                const timeString = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
                const dateString = dateObj.toLocaleDateString('es-CO');
                const orderNum = order.id ? order.id.slice(-4).toUpperCase() : 'N/A';

                return (
                  <div 
                    key={order.id} 
                    className="order-card animate-slide-up"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    {/* Top Row: Order ID, Time and Status Dropdown */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                          Pedido #{orderNum}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                          {dateString} • {timeString}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Estado:</span>
                        <select
                          value={order.status}
                          onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                          className="form-control"
                          style={{
                            width: 'auto',
                            padding: '6px 12px',
                            fontSize: '0.85rem',
                            borderRadius: '6px',
                            height: 'auto',
                            appearance: 'auto',
                            WebkitAppearance: 'auto',
                            backgroundColor: order.status === 'pendiente' ? 'rgba(222, 142, 0, 0.1)' : order.status === 'cancelado' ? 'rgba(255, 0, 0, 0.1)' : 'rgba(37, 211, 102, 0.1)',
                            color: order.status === 'pendiente' ? 'var(--accent-gold)' : order.status === 'cancelado' ? '#ff453a' : '#25d366',
                            border: '1px solid currentColor',
                            fontWeight: '600'
                          }}
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="en cocina">En Cocina</option>
                          <option value="en camino">En Camino</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', width: '100%' }}></div>

                    {/* Content Section: Domicilio & Productos */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Left: Shipping details */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px', fontWeight: '700' }}>Datos de Entrega</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <p style={{ margin: 0, fontSize: '1.05rem' }}>👤 <b>{order.clientName}</b></p>
                          <p style={{ margin: 0, fontSize: '0.95rem' }}>
                            📞 <a href={`tel:${order.clientPhone}`} style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>{order.clientPhone}</a>
                          </p>
                          <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.4' }}>📍 {order.clientAddress}</p>
                          <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>
                            Pago: 
                            <span 
                              style={{ 
                                marginLeft: '6px', 
                                fontWeight: '600',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: order.paymentMethod === 'nequi' ? 'rgba(0,112,243,0.1)' : 'rgba(37,211,102,0.1)',
                                color: order.paymentMethod === 'nequi' ? '#3291ff' : '#25d366'
                              }}
                            >
                              {order.paymentMethod === 'nequi' ? '💳 Transferencia' : '💵 Domicilio Contra Entrega'}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Order list */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px', fontWeight: '700' }}>Detalles del Pedido</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {order.items && order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                              <span>• {item.name} <b style={{ color: 'var(--accent-gold)' }}>x{item.quantity}</b></span>
                              <span style={{ color: 'var(--text-secondary)' }}>{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ borderTop: '1px dashed var(--border-color)', margin: '14px 0 8px 0' }}></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                          <span>TOTAL:</span>
                          <span style={{ color: 'var(--accent-gold)' }}>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', width: '100%' }}></div>

                    {/* Bottom Actions Row */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                      {order.paymentMethod === 'nequi' && order.status === 'pendiente' && (
                        <button
                          type="button"
                          onClick={() => onUpdateOrderStatus(order.id, 'en cocina')}
                          className="btn btn-secondary"
                          style={{
                            textTransform: 'none',
                            fontSize: '0.85rem',
                            padding: '8px 16px',
                            borderColor: '#25d366',
                            color: '#25d366',
                            backgroundColor: 'transparent',
                            borderRadius: '30px'
                          }}
                        >
                          ✓ Validar Transferencia
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => sendStatusWhatsApp(order)}
                        className="btn btn-secondary"
                        style={{
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          padding: '8px 16px',
                          borderColor: '#25d366',
                          color: '#25d366',
                          backgroundColor: 'transparent',
                          borderRadius: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.592 1.97 14.12 .946 11.5 .946c-5.423 0-9.842 4.37-9.846 9.8.001 1.93.523 3.8 1.511 5.4l-.993 3.625 3.73-.977zm11.536-6.52c-.27-.135-1.595-.788-1.842-.877-.248-.09-.427-.135-.607.135-.179.27-.697.877-.854 1.057-.158.18-.315.202-.586.067-1.18-.592-1.96-1.01-2.735-2.338-.204-.352.204-.326.583-1.085.09-.18.045-.337-.022-.472-.068-.135-.608-1.464-.833-2.005-.22-.529-.462-.458-.63-.466-.153-.008-.329-.01-.505-.01-.176 0-.463.067-.704.326-.241.26-.92.9-.92 2.196 0 1.297.945 2.546 1.077 2.726.133.18 1.861 2.842 4.508 3.982.63.272 1.12.434 1.503.555.632.201 1.21.172 1.665.105.508-.075 1.595-.653 1.82-.1282.225-.63.225-1.17.157-1.26-.068-.09-.248-.135-.518-.27z" />
                        </svg>
                        Notificar WhatsApp
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => printComanda(order)}
                        className="btn btn-primary"
                        style={{
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          padding: '8px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '30px'
                        }}
                      >
                        🖨️ Imprimir Comanda
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteOrder(order.id)}
                        className="btn-delete-action"
                        style={{
                          padding: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          border: '1px solid rgba(255,0,0,0.15)',
                          backgroundColor: 'transparent',
                          width: '36px',
                          height: '36px'
                        }}
                        title="Eliminar de historial"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Products Table */
          <div className="admin-table-container animate-fade-in">
            {menuItems.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No hay productos registrados en el menú. Utilice el botón "Agregar Producto" para comenzar.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Imagen</th>
                    <th>Plato</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Insignia</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <img src={item.image} alt={item.name} className="table-img" />
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '1.05rem', marginBottom: '4px' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </div>
                      </td>
                      <td>
                        <span className="badge-category">{getCategoryLabel(item.category)}</span>
                      </td>
                      <td>
                        <span className="table-price">{formatPrice(item.price)}</span>
                      </td>
                      <td>
                        {item.badge ? (
                          <span className="menu-badge" style={{ position: 'static', display: 'inline-block' }}>
                            {item.badge}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.85rem' }}>Ninguna</span>
                        )}
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            className="btn-edit-action"
                            title="Editar producto"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item.id, item.name)}
                            className="btn-delete-action"
                            title="Eliminar producto"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Form Modal Popup */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '580px' }}>
            <button onClick={() => setIsFormOpen(false)} className="modal-close-btn" aria-label="Cerrar">
              <X size={20} />
            </button>
            
            <h3 className="modal-title">
              {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h3>
            <p className="modal-subtitle">
              Complete los campos para registrar el producto en el catálogo.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="prod-name">Nombre del Plato</label>
                <input
                  type="text"
                  id="prod-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Ej: Raviolis de Salmón"
                  required
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Precio (COP)</label>
                  <input
                    type="number"
                    id="prod-price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: 45000"
                    required
                  />
                  {errors.price && <p className="form-error">{errors.price}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-category">Categoría</label>
                  <select
                    id="prod-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-control"
                    style={{ appearance: 'auto', WebkitAppearance: 'auto' }}
                  >
                    <option value="rapida">Comida Rápida</option>
                    <option value="acompanamientos">Acompañamientos</option>
                    <option value="helados">Helados</option>
                    <option value="bebidas">Bebidas</option>
                  </select>
                </div>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-badge">Insignia (Opcional)</label>
                  <input
                    type="text"
                    id="prod-badge"
                    name="badge"
                    value={formData.badge}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Ej: Especial, Vegano, Nuevo"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Foto del Alimento</label>
                  <div className="file-upload-wrapper">
                    <label className={`file-upload-label ${formData.image ? 'has-file' : ''}`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="upload-icon" style={{ opacity: 0.8 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                        {formData.image ? '✓ Foto cargada (Haz clic para cambiar)' : 'Seleccionar o arrastrar foto de la PC'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="file-upload-input"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  {isUploading && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Subiendo foto...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', backgroundColor: 'var(--accent-gold)', transition: 'width 0.1s ease' }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {formData.image && (
                <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                  <span className="form-label">Vista Previa de la Foto</span>
                  <img 
                    src={formData.image} 
                    alt="Vista previa del plato" 
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="prod-description">Descripción del Plato</label>
                <textarea
                  id="prod-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Describa los ingredientes y la preparación del plato..."
                  required
                ></textarea>
                {errors.description && <p className="form-error">{errors.description}</p>}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '12px' }}
                disabled={isUploading}
              >
                <Save size={18} style={{ marginRight: '6px' }} /> {isUploading ? 'Subiendo Imagen...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
