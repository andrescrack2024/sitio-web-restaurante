import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';

export default function Cart({
  isOpen,
  onClose,
  cartItems,
  updateQuantity,
  removeFromCart,
  updateCartItemSauces,
  onProceedToCheckout
}) {
  const [activeHint, setActiveHint] = React.useState('confirm');

  // Reset activeHint when cart is opened
  React.useEffect(() => {
    if (isOpen) {
      const hasCustomizable = cartItems.some(item => 
        item.category === 'hamburguesas' || 
        item.category === 'perros' || 
        item.category === 'salchipapas'
      );
      setActiveHint(hasCustomizable ? 'sauces' : 'qty');
    }
  }, [isOpen]);

  React.useEffect(() => {
    const hasCustomizable = cartItems.some(item => 
      item.category === 'hamburguesas' || 
      item.category === 'perros' || 
      item.category === 'salchipapas'
    );
    if (!hasCustomizable && activeHint === 'sauces') {
      setActiveHint('qty');
    }
  }, [cartItems, activeHint]);

  if (!isOpen) return null;

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
            <div className="cart-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cartItems.map((item, index) => (
                <div key={item.cartKey} className="cart-item animate-slide-up" style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', alignItems: 'flex-start' }}>
                  <img src={item.image} alt={item.name} className="cart-item-img" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                  
                  <div className="cart-item-info" style={{ flexGrow: 1 }}>
                    <h4 className="cart-item-name" style={{ fontSize: '0.92rem', fontWeight: '600', margin: 0 }}>{item.name}</h4>
                    
                    {/* Selected sauces */}
                    {(item.category === 'hamburguesas' || 
                      item.category === 'perros' || 
                      item.category === 'salchipapas') ? (
                        <div 
                          id={index === 0 ? "tour-cart-sauces" : undefined} 
                          onClick={() => setActiveHint('sauces')}
                          style={{ margin: '6px 0', position: 'relative' }}
                        >
                          {activeHint === 'sauces' && index === 0 && (
                            <div className="flow-hint-bubble tooltip-top" style={{ bottom: 'calc(100% + 8px)' }}>
                              <span className="flow-hint-hand">👇</span>
                              <span>Elige tus salsas</span>
                            </div>
                          )}
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (activeHint !== 'sauces') {
                                      setActiveHint('sauces');
                                    }
                                  }}
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
                                      if (activeHint === 'sauces') {
                                        setActiveHint('qty');
                                      }
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
                      
                      <div 
                        id={index === 0 ? "tour-cart-qty" : undefined} 
                        className="cart-item-actions" 
                        onClick={() => setActiveHint('qty')}
                        style={{ position: 'relative' }}
                      >
                        {activeHint === 'qty' && index === 0 && (
                          <div className="flow-hint-bubble tooltip-bottom">
                            <span className="flow-hint-hand">👆</span>
                            <span>Ajusta la cantidad</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.cartKey, -1);
                            if (activeHint !== 'qty') {
                              setActiveHint('qty');
                            } else {
                              setActiveHint('confirm');
                            }
                          }}
                          className="quantity-btn"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="cart-item-quantity">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateQuantity(item.cartKey, 1);
                            if (activeHint !== 'qty') {
                              setActiveHint('qty');
                            } else {
                              setActiveHint('confirm');
                            }
                          }}
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
          )}
        </div>

        {cartItems.length > 0 && (
          <div 
            onClick={() => setActiveHint('confirm')}
            className="cart-footer animate-slide-up" 
            style={{ borderTop: '2px solid var(--border-color)', padding: '16px 24px', backgroundColor: 'var(--bg-primary)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '700', borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '2px' }}>
                <span>Subtotal:</span>
                <span className="text-gold">{formatPrice(subtotal)}</span>
              </div>
            </div>
            
            <div style={{ position: 'relative', width: '100%' }}>
              {activeHint === 'confirm' && (
                <div className="flow-hint-bubble tooltip-top" style={{ bottom: 'calc(100% + 10px)' }}>
                  <span className="flow-hint-hand">👇</span>
                  <span>Confirma tu pedido aquí</span>
                </div>
              )}
              <button
                onClick={onProceedToCheckout}
                id="tour-checkout-btn"
                className="btn btn-primary btn-checkout"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', minHeight: '48px', fontSize: '0.95rem' }}
              >
                Confirmar Pedido
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
