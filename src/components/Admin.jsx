import React, { useState } from 'react';
import { Plus, Edit3, Trash2, ArrowLeft, Save, X, Info } from 'lucide-react';
import { storage, isFirebaseSupported } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function Admin({
  menuItems,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onGoBack
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
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
            <p>Gestión del menú, categorías y precios del restaurante.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onGoBack} className="btn btn-secondary" style={{ textTransform: 'none' }}>
              <ArrowLeft size={16} /> Volver al Sitio
            </button>
            <button onClick={openAddModal} className="btn btn-primary" style={{ textTransform: 'none' }}>
              <Plus size={16} /> Agregar Producto
            </button>
          </div>
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
          <p>
            Los cambios realizados aquí se guardan localmente en el navegador (**LocalStorage**). Cualquier adición, edición de precios o eliminación de platos se reflejará de inmediato en el catálogo de clientes del sitio web.
          </p>
        </div>

        {/* Table List */}
        <div className="admin-table-container animate-fade-in">
          {menuItems.length === 0 ? (
            <div style={{ padding: '40px', textAlignment: 'center', color: 'var(--text-secondary)' }}>
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
                          onClick={() => openEditModal(item)}
                          className="btn-edit-action"
                          title="Editar producto"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
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
