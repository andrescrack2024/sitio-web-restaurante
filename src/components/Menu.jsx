import React, { useState } from 'react';
import { Plus, Check, X, Clock, Heart, Sparkles } from 'lucide-react';

export const MENU_ITEMS = [
  {
    id: 1,
    name: 'Hamburguesa Clásica con Queso',
    category: 'rapida',
    price: 18000,
    description: 'Carne de res premium de 150g, queso cheddar fundido, lechuga fresca, tomate, cebolla caramelizada y salsa especial de la casa en pan brioche artesanal.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Popular'
  },
  {
    id: 2,
    name: 'Hamburguesa Suprema Doble Carne',
    category: 'rapida',
    price: 26000,
    description: 'Dos carnes de res de 150g, tocineta ahumada crujiente, queso cheddar doble, aros de cebolla crujientes y salsa BBQ artesanal en pan brioche.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Recomendada'
  },
  {
    id: 3,
    name: 'Perro Caliente Especial Americano',
    category: 'rapida',
    price: 15000,
    description: 'Salchicha tipo americana gigante, queso fundido, ripio de papa crujiente, tocineta picada, cebolla caramelizada y salsas tradicionales de la casa.',
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'El Favorito'
  },
  {
    id: 4,
    name: 'Salchipapa Suprema de la Casa',
    category: 'rapida',
    price: 19000,
    description: 'Cama de papas a la francesa doradas, salchicha premium seleccionada, queso gratinado, tocineta picada, maíz dulce y salsa tártara artesanal.',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Gran Tamaño'
  },
  {
    id: 5,
    name: 'Papas Fritas Rústicas al Romero',
    category: 'acompanamientos',
    price: 8000,
    description: 'Porción generosa de papas fritas rústicas con piel, sazonadas con sal marina, romero fresco y un toque de paprika, servidas con salsa de ajo.',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Crujiente'
  },
  {
    id: 6,
    name: 'Aros de Cebolla Crujientes',
    category: 'acompanamientos',
    price: 9000,
    description: 'Anillos de cebolla tiernos rebozados en panko crujiente y fritos a la perfección, acompañados de salsa BBQ de la casa.',
    image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Adicional'
  },
  {
    id: 7,
    name: 'Copa Helada con Galleta Oreo',
    category: 'helados',
    price: 12000,
    description: 'Deliciosa copa con dos bolas de helado artesanal de vainilla Bourbon y chocolate, galletas Oreo trituradas, salsa de chocolate fudge y crema batida.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Especial'
  },
  {
    id: 8,
    name: 'Banana Split Tres Sabores',
    category: 'helados',
    price: 16000,
    description: 'Banano maduro entero acompañado de tres bolas de helado (fresa natural, chocolate suizo y vainilla), bañado en salsa de caramelo, chispas de colores y cereza.',
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Clásico'
  },
  {
    id: 9,
    name: 'Malteada Cremosa de Fresa',
    category: 'helados',
    price: 11000,
    description: 'Batido ultra-cremoso elaborado con helado de fresa natural, leche entera y decorado con crema chantilly, fresa fresca y chispas de chocolate.',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Deliciosa'
  },
  {
    id: 10,
    name: 'Limonada Frappé Cerezada',
    category: 'bebidas',
    price: 9000,
    description: 'Refrescante limonada granizada licuada con limones recién exprimidos y un delicioso sirope artesanal de cereza silvestre.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Refrescante'
  },
  {
    id: 11,
    name: 'Gaseosa Helada 350ml',
    category: 'bebidas',
    price: 4500,
    description: 'Bebida gaseosa helada en presentación personal a su elección (Coca-Cola, Sprite, Fanta o Colombiana).',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Bebida'
  },
  {
    id: 12,
    name: 'Perro Caliente Mediano',
    category: 'rapida',
    price: 11000,
    description: 'Salchicha clásica de 15cm, queso mozzarella fundido, abundante ripio de papa crujiente y salsa rosada tradicional en pan tierno.',
    image: 'https://images.unsplash.com/photo-1627059313833-0a29507f4b22?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Mediano'
  },
  {
    id: 13,
    name: 'Perro Caliente Pequeño (Junior)',
    category: 'rapida',
    price: 8000,
    description: 'Salchicha junior de 10cm, ripio de papa crujiente y salsas tradicionales (ketchup y mostaza). El tamaño ideal para los más pequeños.',
    image: 'https://images.unsplash.com/photo-1541232264-8066f8e0b4c1?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Infantil'
  },
  {
    id: 14,
    name: 'Salchipapa Mediana Clásica',
    category: 'rapida',
    price: 13000,
    description: 'Papas fritas a la francesa doradas, salchicha clásica picada, salsas de la casa y coronada con un toque de queso costeño rallado.',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Clásica'
  },
  {
    id: 15,
    name: 'Salchipapa Pequeña Sencilla',
    category: 'rapida',
    price: 9000,
    description: 'Porción individual para calmar el antojo: papas fritas doradas acompañadas de salchicha picada y salsas básicas.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Individual'
  },
  {
    id: 16,
    name: 'Mazorcada Especial Gratinada',
    category: 'rapida',
    price: 18000,
    description: 'Cama de papas fritas coronada con maíz tierno salteado con tocineta crujiente, abundante queso mozzarella gratinado, ripio de papa y salsa tártara.',
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Recomendado'
  }
];

export default function Menu({ menuItems = [], addToCart, cartItems, loading }) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [addedAnimationIds, setAddedAnimationIds] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'rapida', label: 'Comida Rápida' },
    { id: 'acompanamientos', label: 'Acompañamientos' },
    { id: 'helados', label: 'Helados' },
    { id: 'bebidas', label: 'Bebidas' }
  ];

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'rapida': return 'Comida Rápida';
      case 'acompanamientos': return 'Acompañamiento';
      case 'helados': return 'Helado';
      case 'bebidas': return 'Bebida';
      default: return cat;
    }
  };

  const filteredItems = activeCategory === 'todos'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <section id="menu" className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: '600' }}>
            Selección Gastronómica
          </p>
          <h2 className="section-title">Nuestra Carta</h2>
          <p className="section-subtitle">
            Cargando la selección de platos en tiempo real...
          </p>

          <div className="menu-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-body">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-text-short"></div>
                  <div className="skeleton-button"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const handleAddClick = (item) => {
    addToCart(item);
    // Show success animation temporarily on the button
    setAddedAnimationIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedAnimationIds(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const isItemInCart = (id) => {
    return cartItems.some(cartItem => cartItem.id === id);
  };

  return (
    <section id="menu" className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        <p className="section-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '8px', fontWeight: '600' }}>
          Selección Gastronómica
        </p>
        <h2 className="section-title">Nuestra Carta</h2>
        <p className="section-subtitle">
          Explore nuestro catálogo de platos exclusivos diseñados para deleitar sus sentidos. Elija sus favoritos para armar su pedido a domicilio.
        </p>

        {/* Category Filters */}
        <div className="menu-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="menu-grid">
          {filteredItems.map((item) => {
            const hasAnimation = addedAnimationIds[item.id];
            const inCart = isItemInCart(item.id);

            return (
              <article key={item.id} className="menu-card animate-slide-up">
                <div 
                  className="menu-img-wrapper" 
                  onClick={() => setSelectedProduct(item)} 
                  style={{ cursor: 'pointer' }}
                  title="Ver detalles del plato"
                >
                  <img src={item.image} alt={item.name} className="menu-img" loading="lazy" />
                  {item.badge && <span className="menu-badge">{item.badge}</span>}
                </div>
                
                <div className="menu-card-body">
                  <div 
                    onClick={() => setSelectedProduct(item)} 
                    style={{ cursor: 'pointer', flexGrow: 1 }}
                    title="Ver detalles del plato"
                  >
                    <div className="menu-card-header">
                      <h3 className="menu-item-title">{item.name}</h3>
                      <span className="menu-item-price">{formatPrice(item.price)}</span>
                    </div>
                    <p className="menu-item-desc">{item.description}</p>
                  </div>
                  
                  <div className="menu-card-footer">
                    <button
                      onClick={() => handleAddClick(item)}
                      className={`btn btn-add-to-cart ${inCart || hasAnimation ? 'btn-secondary' : 'btn-primary'}`}
                      style={{
                        borderColor: hasAnimation ? 'var(--success)' : '',
                        color: hasAnimation ? 'var(--success)' : ''
                      }}
                    >
                      {hasAnimation ? (
                        <>
                          <Check size={16} /> ¡Agregado!
                        </>
                      ) : inCart ? (
                        <>
                          <Check size={16} /> En el Pedido
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Agregar al Pedido
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Dish Detail Modal Popup */}
      {selectedProduct && (
        <div className="detail-modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="detail-modal-content animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedProduct(null)} className="modal-close-btn" aria-label="Cerrar">
              <X size={20} />
            </button>
            
            <div className="detail-modal-img-wrapper">
              <img src={selectedProduct.image} alt="" className="detail-modal-img-blur-bg" />
              <img src={selectedProduct.image} alt={selectedProduct.name} className="detail-modal-img" />
            </div>

            <div className="detail-modal-body">
              <div className="detail-modal-header">
                <h3 className="detail-modal-title">{selectedProduct.name}</h3>
                <span className="detail-modal-price">{formatPrice(selectedProduct.price)}</span>
              </div>

              <p className="detail-modal-desc">{selectedProduct.description}</p>

              <div className="detail-specs-grid">
                <div>
                  <h4 className="spec-group-title">Detalles de Preparación</h4>
                  <ul className="spec-list">
                    <li>
                      <Clock size={16} className="text-gold" />
                      <span>Tiempo estimado: 15 - 20 minutos</span>
                    </li>
                    <li>
                      <Heart size={16} className="text-gold" />
                      <span>Ingredientes frescos y seleccionados del día</span>
                    </li>
                    <li>
                      <Sparkles size={16} className="text-gold" />
                      <span>Receta exclusiva del Chef Marc Laurent</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="spec-group-title">Etiquetas y Alérgenos</h4>
                  <ul className="spec-list">
                    <li>
                      <span className="badge-category" style={{ margin: 0, textTransform: 'none' }}>
                        Categoría: {getCategoryLabel(selectedProduct.category)}
                      </span>
                    </li>
                    <li>
                      <span>• Apto para vegetarianos si se solicita</span>
                    </li>
                    <li>
                      <span>• Puede contener trazas de lácteos y gluten</span>
                    </li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => {
                  handleAddClick(selectedProduct);
                  setSelectedProduct(null);
                }}
                className="btn btn-primary"
                style={{ width: '100%', textTransform: 'none', letterSpacing: '0.5px' }}
              >
                Agregar a mi pedido • {formatPrice(selectedProduct.price)}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
