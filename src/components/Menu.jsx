import React, { useState } from 'react';
import { Plus, Check, X, Clock, Heart, Sparkles } from 'lucide-react';

export const MENU_ITEMS = [
  {
    id: 1,
    name: 'Hamburguesa Mixta',
    category: 'hamburguesas',
    price: 24000,
    description: 'Exquisita combinación de carne de res, milanesa de pollo crujiente, queso fundido, tocino ahumado y guiso especial en pan brioche artesanal.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'La Más Vendida',
    ingredients: ['Carne de res 150g', 'Milanesa de pollo', 'Queso mozzarella', 'Tocineta crujiente', 'Guiso especial', 'Pan brioche']
  },
  {
    id: 2,
    name: 'Hamburguesa Doble Carne',
    category: 'hamburguesas',
    price: 23000,
    description: 'Doble porción de jugosa carne de res premium, queso cheddar fundido y tocino crujiente en pan brioche artesanal.',
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Especial',
    ingredients: ['Doble carne de res 150g', 'Queso cheddar doble', 'Tocineta crujiente', 'Pan brioche']
  },
  {
    id: 3,
    name: 'Hamburguesa de la Casa',
    category: 'hamburguesas',
    price: 25000,
    description: 'Nuestra hamburguesa insignia con carne artesanal de res de 150g, tocino crujiente, queso gratinado, cebolla caramelizada y salsa especial.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Recomendada',
    ingredients: ['Carne artesanal de res 150g', 'Tocineta crujiente', 'Queso gratinado', 'Cebolla caramelizada', 'Salsa de la casa', 'Pan brioche']
  },
  {
    id: 4,
    name: 'Hamburguesa Sencilla',
    category: 'hamburguesas',
    price: 20000,
    description: 'Carne de res seleccionada, queso derretido, lechuga fresca, tomate y salsas tradicionales de la casa.',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Clásica',
    ingredients: ['Carne de res 150g', 'Queso mozzarella', 'Lechuga', 'Tomate', 'Salsas tradicionales']
  },
  {
    id: 5,
    name: 'Hamburguesa de Pollo',
    category: 'hamburguesas',
    price: 22000,
    description: 'Pechuga de pollo a la plancha tierna y sazonada, tocino crujiente, queso derretido, lechuga y tomate en pan artesanal.',
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Ligera',
    ingredients: ['Pechuga de pollo 150g', 'Tocineta crujiente', 'Queso derretido', 'Lechuga', 'Tomate', 'Pan brioche']
  },
  {
    id: 6,
    name: 'Hamburguesa Milanesa',
    category: 'hamburguesas',
    price: 21000,
    description: 'Filete de pollo apanado estilo milanesa crujiente, tocino ahumado, queso derretido, lechuga y tomate.',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Crujiente',
    ingredients: ['Filete de pollo apanado', 'Tocineta crujiente', 'Queso derretido', 'Lechuga', 'Tomate', 'Pan artesanal']
  },
  {
    id: 7,
    name: 'Perro con Tocino',
    category: 'perros',
    price: 16000,
    description: 'Salchicha americana premium, abundante queso fundido, tocineta crujiente picada y ripio de papa crujiente en pan extra tierno.',
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Favorito',
    ingredients: ['Salchicha americana', 'Queso fundido', 'Tocineta crujiente picada', 'Ripio de papa', 'Pan de perro']
  },
  {
    id: 8,
    name: 'Perro Sencillo',
    category: 'perros',
    price: 11500,
    description: 'Salchicha clásica seleccionada, queso mozzarella fundido, ripio de papa crujiente y salsas tradicionales.',
    image: 'https://images.unsplash.com/photo-1627059313833-0a29507f4b22?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Económico',
    ingredients: ['Salchicha clásica', 'Queso mozzarella', 'Ripio de papa', 'Pan de perro']
  },
  {
    id: 9,
    name: 'Perro Suizo',
    category: 'perros',
    price: 20000,
    description: 'Delicioso perro caliente con salchicha suiza gigante, queso gratinado doble, tocineta picada y abundante ripio de papa.',
    image: 'https://images.unsplash.com/photo-1541232264-8066f8e0b4c1?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Premium',
    ingredients: ['Salchicha suiza gigante', 'Queso gratinado doble', 'Tocineta picada', 'Ripio de papa', 'Pan de perro']
  },
  {
    id: 10,
    name: 'Perro Americano',
    category: 'perros',
    price: 19000,
    description: 'Salchicha americana gigante, tocineta crujiente, cebolla caramelizada suave, queso derretido y ripio de papa.',
    image: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Sabor Único',
    ingredients: ['Salchicha americana gigante', 'Tocineta crujiente', 'Cebolla caramelizada', 'Queso derretido', 'Ripio de papa']
  },
  {
    id: 11,
    name: 'Perro con Chorizo',
    category: 'perros',
    price: 16000,
    description: 'Chorizo parrillero picado de excelente calidad, queso gratinado, tocineta crujiente, ripio de papa y salsas de la casa.',
    image: 'https://images.unsplash.com/photo-1541232264-8066f8e0b4c1?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Parrillero',
    ingredients: ['Chorizo parrillero seleccionado', 'Queso gratinado', 'Tocineta crujiente', 'Ripio de papa', 'Pan de perro']
  },
  {
    id: 12,
    name: 'Perra',
    category: 'perros',
    price: 16000,
    description: 'Abundante queso mozzarella gratinado, tocineta crujiente picada y ripio de papa crujiente en pan tierno (sin salchicha).',
    image: 'https://images.unsplash.com/photo-1627059313833-0a29507f4b22?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Especial Queso',
    ingredients: ['Abundante queso mozzarella', 'Tocineta crujiente', 'Ripio de papa', 'Pan de perro']
  },
  {
    id: 13,
    name: 'Salchipapa Grande',
    category: 'salchipapas',
    price: 45000,
    description: 'Super porción familiar de papas fritas doradas, salchicha manguera premium, tocineta, abundante queso gratinado y salsas.',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Familiar',
    ingredients: ['Papas fritas familiares', 'Salchicha manguera premium', 'Tocineta picada', 'Abundante queso gratinado']
  },
  {
    id: 14,
    name: 'Salchipapa Mediana',
    category: 'salchipapas',
    price: 29000,
    description: 'Porción mediana de papas fritas doradas con salchicha premium seleccionada, queso mozzarella gratinado y salsas de la casa.',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Para Compartir',
    ingredients: ['Papas fritas medianas', 'Salchicha premium', 'Queso mozzarella gratinado', 'Salsas de la casa']
  },
  {
    id: 15,
    name: 'Salchipapa Pequeña',
    category: 'salchipapas',
    price: 20000,
    description: 'Porción individual con papas fritas crujientes, salchicha clásica picada, queso mozzarella fundido y salsas del restaurante.',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Individual',
    ingredients: ['Papas fritas personales', 'Salchicha clásica picada', 'Queso mozzarella fundido', 'Salsas']
  },
  {
    id: 16,
    name: 'Gaseosa Helada 350ml',
    category: 'bebidas',
    price: 4500,
    description: 'Bebida gaseosa helada en presentación personal a su elección (Coca-Cola, Sprite, Colombiana).',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Bebida',
    ingredients: ['Gaseosa personal 350ml']
  },
  {
    id: 17,
    name: 'Gaseosa Familiar 1.5 Litros',
    category: 'bebidas',
    price: 7000,
    description: 'Gaseosa tamaño familiar ideal para compartir con tus combos o platos favoritos.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Familiar',
    ingredients: ['Gaseosa familiar 1.5L']
  },
  {
    id: 18,
    name: 'Limonada Frappé Cerezada',
    category: 'bebidas',
    price: 9000,
    description: 'Refrescante limonada granizada licuada con limones frescos y un delicioso sirope artesanal de cereza.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Refrescante',
    ingredients: ['Limones frescos exprimidos', 'Sirope de cereza artesanal', 'Hielo frappé']
  },
  {
    id: 19,
    name: 'Picada Familiar',
    category: 'especiales',
    price: 90000,
    description: 'Abundante bandeja con trozos de carne de res, pechuga de pollo, chorizo, chicharrón crujiente, papas fritas y arepitas.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Super Especial',
    ingredients: ['Carne de res picada', 'Pechuga de pollo picada', 'Chorizo picado', 'Chicharrón crujiente', 'Papas fritas', 'Arepitas']
  },
  {
    id: 20,
    name: 'Combo 1 (2 Perros + Gaseosa 1.5L)',
    category: 'especiales',
    price: 38000,
    description: '2 perros sencillos acompañados de una gaseosa familiar de 1.5 litros helada.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Combo Perros',
    ingredients: ['2 Perros sencillos con salsas', '1 Gaseosa familiar 1.5L']
  },
  {
    id: 21,
    name: 'Combo 2 (2 Burguers + 2 Perros + Gaseosa 1.5L)',
    category: 'especiales',
    price: 58000,
    description: '2 hamburguesas sencillas + 2 perros sencillos + una gaseosa familiar de 1.5 litros.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Combo Grande',
    ingredients: ['2 Hamburguesas sencillas', '2 Perros sencillos', '1 Gaseosa familiar 1.5L']
  },
  {
    id: 22,
    name: 'Combo 3 (2 Salchipapas + Gaseosa 1.5L)',
    category: 'especiales',
    price: 58000,
    description: '2 salchipapas pequeñas abundantes acompañadas de una gaseosa familiar de 1.5 litros.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Combo Salchipapa',
    ingredients: ['2 Salchipapas pequeñas individuales', '1 Gaseosa familiar 1.5L']
  },
  {
    id: 23,
    name: 'Combo 4 (2 Burguers + 2 Papas)',
    category: 'especiales',
    price: 23000,
    description: '2 hamburguesas sencillas acompañadas de 2 porciones de papas fritas individuales crujientes.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Combo Duo',
    ingredients: ['2 Hamburguesas sencillas', '2 Porciones de papas fritas']
  },
  {
    id: 24,
    name: 'Combo 5 (1 Burguer + Papas + Gaseosa)',
    category: 'especiales',
    price: 19000,
    description: '1 hamburguesa sencilla + porción de papas fritas individuales + gaseosa personal de 350ml.',
    image: 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=500&q=60',
    badge: 'Combo Individual',
    ingredients: ['1 Hamburguesa sencilla', '1 Porción de papas fritas', '1 Gaseosa personal 350ml']
  }
];

export default function Menu({ menuItems = [], addToCart, cartItems, loading, celebrationTheme }) {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [addedAnimationIds, setAddedAnimationIds] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSauces, setSelectedSauces] = useState(['Rosada', 'Roja']);

  const categories = [
    { id: 'todos', label: 'Todos', icon: '🍽️' },
    { id: 'hamburguesas', label: 'Hamburguesas', icon: '🍔' },
    { id: 'perros', label: 'Perros', icon: '🌭' },
    { id: 'salchipapas', label: 'Salchipapas', icon: '🍟' },
    { id: 'bebidas', label: 'Bebidas', icon: '🥤' },
    { id: 'especiales', label: 'Especiales / Combos', icon: '🍱' }
  ];

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'hamburguesas': return 'Hamburguesa';
      case 'perros': return 'Perro Caliente';
      case 'salchipapas': return 'Salchipapa';
      case 'bebidas': return 'Bebida';
      case 'especiales': return 'Especial / Combo';
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

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    if (product) {
      setSelectedSauces(['Rosada', 'Roja']);
    }
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

  const handleAddClick = (item, sauces) => {
    const isCustomizable = item.category === 'hamburguesas' || item.category === 'perros' || item.category === 'salchipapas';
    const finalSauces = isCustomizable ? (sauces || ['Rosada', 'Roja']) : [];
    
    addToCart(item, finalSauces);
    
    setAddedAnimationIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedAnimationIds(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  const isItemInCart = (id) => {
    return cartItems.some(cartItem => String(cartItem.id) === String(id));
  };

  return (
    <section id="menu" className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Celebration Banner */}
        {celebrationTheme && celebrationTheme !== 'normal' && (
          <div className={`celebration-banner ${celebrationTheme}`} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 24px',
            borderRadius: '12px',
            marginBottom: '32px',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
            color: '#fff',
            fontWeight: '600',
            fontSize: '1.05rem',
            animation: 'pulse-glow 3s infinite alternate',
            background: celebrationTheme === 'soccer' 
              ? 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)'
              : celebrationTheme === 'champions'
              ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)'
              : celebrationTheme === 'colombia'
              ? 'linear-gradient(135deg, #eab308 0%, #2563eb 50%, #dc2626 100%)'
              : celebrationTheme === 'christmas' 
              ? 'linear-gradient(135deg, #991b1b 0%, #dc2626 100%)' 
              : celebrationTheme === 'halloween'
              ? 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)'
              : celebrationTheme === 'valentine'
              ? 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)'
              : 'linear-gradient(135deg, #be185d 0%, #f43f5e 100%)',
            border: celebrationTheme === 'soccer'
              ? '2px solid #ffd700'
              : celebrationTheme === 'champions'
              ? '2px solid #fbbf24'
              : celebrationTheme === 'colombia'
              ? '2px solid #eab308'
              : celebrationTheme === 'christmas'
              ? '2px solid #fbbf24'
              : celebrationTheme === 'halloween'
              ? '2px solid #a855f7'
              : celebrationTheme === 'valentine'
              ? '2px solid #fdf2f8'
              : '2px solid #fef2f2'
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {celebrationTheme === 'soccer' && '⚽'}
              {celebrationTheme === 'champions' && '🏆'}
              {celebrationTheme === 'colombia' && '🇨🇴'}
              {celebrationTheme === 'christmas' && '🎄'}
              {celebrationTheme === 'halloween' && '🎃'}
              {celebrationTheme === 'valentine' && '💖'}
              {celebrationTheme === 'mothers' && '🌸'}
            </span>
            <span>
              {celebrationTheme === 'soccer' && '¡VIVE EL MUNDIAL EN RÁPIDO & DELI! ⚽ Disfruta los mejores platos para acompañar tu pasión. 🏆'}
              {celebrationTheme === 'champions' && '⚽ ¡NOCHES DE CHAMPIONS EN RÁPIDO & DELI! 🏆 Vive el mejor fútbol con un sabor estelar. ⭐'}
              {celebrationTheme === 'colombia' && '🇨🇴 ¡APOYANDO A LA SELECCIÓN COLOMBIA! ⚽ Vive la pasión tricolor con Rápido & Deli. 💛💙❤️'}
              {celebrationTheme === 'christmas' && '🎄 ¡FELIZ NAVIDAD Y PRÓSPERO AÑO NUEVO! 🎅 Celebra con el sabor más deli de Quibdó. 🎁'}
              {celebrationTheme === 'halloween' && '🎃 ¡SABOR DE MIEDO EN HALLOWEEN! 👻 Disfruta nuestras delicias espeluznantes. 🦇'}
              {celebrationTheme === 'valentine' && '💖 ¡ESPECIAL DE SAN VALENTÍN! 💕 Comparte el amor y el sabor más deli con esa persona especial. 🌹'}
              {celebrationTheme === 'mothers' && '🌸 ¡FELIZ DÍA DE LA MADRE! 🤱 Consiente a mamá con el sabor exquisito que ella se merece. 🌷'}
            </span>
            <span style={{ fontSize: '1.5rem' }}>
              {celebrationTheme === 'soccer' && '🍔'}
              {celebrationTheme === 'champions' && '⭐'}
              {celebrationTheme === 'colombia' && '⚽'}
              {celebrationTheme === 'christmas' && '🎅'}
              {celebrationTheme === 'halloween' && '👻'}
              {celebrationTheme === 'valentine' && '🌹'}
              {celebrationTheme === 'mothers' && '🤱'}
            </span>
          </div>
        )}

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
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="menu-grid">
          {filteredItems.map((item, index) => {
            const hasAnimation = addedAnimationIds[item.id];
            const inCart = isItemInCart(item.id);

            return (
              <article key={item.id} className="menu-card animate-slide-up">
                <div 
                  className="menu-img-wrapper" 
                  onClick={() => handleSelectProduct(item)} 
                  style={{ cursor: 'pointer' }}
                  title="Ver detalles del plato"
                >
                  <img src={item.image} alt={item.name} className="menu-img" loading="lazy" />
                  {item.badge && <span className="menu-badge">{item.badge}</span>}
                </div>
                
                <div className="menu-card-body">
                  <div 
                    onClick={() => handleSelectProduct(item)} 
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
                      id={index === 0 ? 'tour-first-add-btn' : undefined}
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

              {/* Ingredients section */}
              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <div style={{ margin: '16px 0', textAlign: 'left' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🥣 Ingredientes principales:
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedProduct.ingredients.map((ing, idx) => (
                      <span key={idx} style={{ 
                        fontSize: '0.8rem', 
                        padding: '4px 10px', 
                        backgroundColor: 'var(--bg-tertiary)', 
                        borderRadius: '20px', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-secondary)' 
                      }}>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sauces checklist */}
              {(selectedProduct.category === 'hamburguesas' || 
                selectedProduct.category === 'perros' || 
                selectedProduct.category === 'salchipapas') && (
                <div className="sauce-selector-container" style={{ margin: '20px 0', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                    <Sparkles size={16} className="text-gold" /> Personaliza tus Salsas (Gratis)
                  </h4>
                  <div className="sauce-grid">
                    {['Rosada', 'Roja', 'Tártara', 'Ajo', 'Piña', 'Mostaza'].map(sauce => {
                      const isChecked = selectedSauces.includes(sauce);
                      return (
                        <label 
                          key={sauce} 
                          className={`sauce-pill ${isChecked ? 'active' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSauces(prev => [...prev, sauce]);
                              } else {
                                setSelectedSauces(prev => prev.filter(s => s !== sauce));
                              }
                            }}
                          />
                          <span>{sauce}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

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
                      <span>• Puede contener trazas de lácteos y gluten</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <button
                  onClick={() => {
                    handleAddClick(selectedProduct, selectedSauces);
                    setSelectedProduct(null);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', textTransform: 'none', letterSpacing: '0.5px' }}
                >
                  Agregar al Carrito • {formatPrice(selectedProduct.price)}
                </button>
                <button
                  onClick={() => {
                    const number = "573126602583";
                    const priceFormatted = formatPrice(selectedProduct.price);
                    const saucesStr = selectedSauces.length > 0 ? ` con salsas (${selectedSauces.join(', ')})` : '';
                    const text = `¡Hola! Quisiera ordenar a domicilio: *${selectedProduct.name}*${saucesStr} (${priceFormatted}). ¿Me confirman disponibilidad y tiempo de entrega?`;
                    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
                    setSelectedProduct(null);
                  }}
                  className="btn btn-secondary"
                  style={{ 
                    width: '100%', 
                    textTransform: 'none', 
                    letterSpacing: '0.5px', 
                    backgroundColor: '#25D366', 
                    color: '#ffffff',
                    borderColor: '#25D366',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.592 1.97 14.12 .946 11.5 .946c-5.423 0-9.842 4.37-9.846 9.8.001 1.93.523 3.8 1.511 5.4l-.993 3.625 3.73-.977zm11.536-6.52c-.27-.135-1.595-.788-1.842-.877-.248-.09-.427-.135-.607.135-.179.27-.697.877-.854 1.057-.158.18-.315.202-.586.067-1.18-.592-1.96-1.01-2.735-2.338-.204-.352.204-.326.583-1.085.09-.18.045-.337-.022-.472-.068-.135-.608-1.464-.833-2.005-.22-.529-.462-.458-.63-.466-.153-.008-.329-.01-.505-.01-.176 0-.463.067-.704.326-.241.26-.92.9-.92 2.196 0 1.297.945 2.546 1.077 2.726.133.18 1.861 2.842 4.508 3.982.63.272 1.12.434 1.503.555.632.201 1.21.172 1.665.105.508-.075 1.595-.653 1.82-.1282.225-.63.225-1.17.157-1.26-.068-.09-.248-.135-.518-.27z" />
                  </svg>
                  Pedir ahora por WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
