import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  onProceedToCheckout
}) {
  if (!isOpen) return null;

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
            cartItems.map((item) => (
              <div key={item.cartKey} className="cart-item animate-slide-up">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  
                  {/* Selected sauces */}
                  {item.sauces && item.sauces.length > 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '2px 0 6px 0' }}>
                      Salsas: {item.sauces.join(', ')}
                    </p>
                  )}
                  
                  <span className="cart-item-price">{formatPrice(item.price)}</span>
                  
                  <div className="cart-item-actions">
                    <button
                      onClick={() => updateQuantity(item.cartKey, -1)}
                      className="quantity-btn"
                      aria-label="Disminuir cantidad"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="cart-item-quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cartKey, 1)}
                      className="quantity-btn"
                      aria-label="Aumentar cantidad"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartKey)}
                  className="btn-remove-item"
                  title="Eliminar artículo"
                  aria-label="Eliminar artículo"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer animate-slide-up">
            <div className="cart-totals">
              <span>Total Estimado:</span>
              <span className="text-gold">{formatPrice(total)}</span>
            </div>
            
            <button
              onClick={onProceedToCheckout}
              id="tour-checkout-btn"
              className="btn btn-primary btn-checkout"
            >
              Confirmar Datos de Entrega
            </button>
          </div>
        )}
      </div>
    </>
  );
}
