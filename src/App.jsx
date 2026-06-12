import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu, { MENU_ITEMS } from './components/Menu';
import Cart from './components/Cart';
import OrderModal from './components/OrderModal';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Admin from './components/Admin';
import { db, isFirebaseSupported } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ShoppingBag } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [menuItems, setMenuItems] = useState(() => {
    if (isFirebaseSupported) {
      return []; // Loaded from firestore
    } else {
      const saved = localStorage.getItem('rapidoydeli_menu');
      return saved ? JSON.parse(saved) : MENU_ITEMS;
    }
  });
  const [loading, setLoading] = useState(isFirebaseSupported);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [view, setView] = useState(() => window.location.hash === '#admin' ? 'admin' : 'shop');
  
  // Ref to ensure migration check runs exactly once when component mounts
  const migrationCheckedRef = useRef(false);

  // Handle hash-based routing for admin panel
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('admin');
      } else {
        setView('shop');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync state to LocalStorage ONLY in local fallback mode
  useEffect(() => {
    if (!isFirebaseSupported) {
      localStorage.setItem('rapidoydeli_menu', JSON.stringify(menuItems));
    }
  }, [menuItems]);

  // Firebase Firestore subscription & optimized one-time migration check
  useEffect(() => {
    if (!isFirebaseSupported) return;

    const menuCollection = collection(db, 'menu');

    const unsubscribe = onSnapshot(menuCollection, async (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });

      // 1. One-time migration and seed check
      if (!migrationCheckedRef.current) {
        migrationCheckedRef.current = true; // Mark as checked immediately to avoid any re-runs

        const hasGourmet = items.some(item => 
          item.name === 'Carpaccio de Lomo' || 
          item.name === 'Crema de Tomates Rostizados' ||
          item.category === 'entradas' ||
          item.category === 'fuertes' ||
          item.category === 'postres'
        );

        if (hasGourmet || items.length === 0) {
          console.log("Migración o inicialización requerida. Limpiando colección...");
          setLoading(true);

          // Delete all current items sequentially to avoid race conditions
          for (const item of items) {
            try {
              await deleteDoc(doc(db, 'menu', String(item.id)));
            } catch (err) {
              console.error("Error al eliminar item antiguo:", err);
            }
          }

          console.log("Colección limpia. Sembrando comida rápida y helados...");
          // Seed new items sequentially
          for (const item of MENU_ITEMS) {
            const { id, ...itemData } = item;
            try {
              await setDoc(doc(db, 'menu', String(id)), itemData);
            } catch (err) {
              console.error("Error al sembrar item inicial:", err);
            }
          }
          console.log("Sembrado inicial exitoso.");
          // The next firestore snapshot will carry the new items and skip this block since migrationCheckedRef is true
          return;
        }
      }

      // 2. Main flow: Sort items by ID so they maintain order and display
      items.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
      setMenuItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => String(i.id) === String(item.id));
      if (existing) {
        return prevItems.map((i) =>
          String(i.id) === String(item.id) ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(id)));
  };

  const updateQuantity = (id, amount) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (String(item.id) === String(id)) {
            const newQuantity = item.quantity + amount;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // CRUD actions mapping
  const handleAddProduct = async (newProduct) => {
    if (isFirebaseSupported) {
      try {
        const nextId = menuItems.length > 0 ? Math.max(...menuItems.map((item) => Number(item.id) || 0)) + 1 : 1;
        await setDoc(doc(db, 'menu', String(nextId)), newProduct);
      } catch (error) {
        console.error("Error writing to Firestore:", error);
      }
    } else {
      setMenuItems((prev) => {
        const nextId = prev.length > 0 ? Math.max(...prev.map((item) => Number(item.id) || 0)) + 1 : 1;
        return [...prev, { ...newProduct, id: nextId }];
      });
    }
  };

  const handleUpdateProduct = async (updatedProduct) => {
    const { id, ...productData } = updatedProduct;
    if (isFirebaseSupported) {
      try {
        await setDoc(doc(db, 'menu', String(id)), productData);
      } catch (error) {
        console.error("Error updating Firestore:", error);
      }
    } else {
      setMenuItems((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? updatedProduct : item))
      );
    }

    // Sync in cart
    setCartItems((prevCart) =>
      prevCart.map((cItem) => {
        if (String(cItem.id) === String(id)) {
          return {
            ...cItem,
            name: updatedProduct.name,
            price: updatedProduct.price,
            image: updatedProduct.image
          };
        }
        return cItem;
      })
    );
  };

  const handleDeleteProduct = async (id) => {
    if (isFirebaseSupported) {
      try {
        await deleteDoc(doc(db, 'menu', String(id)));
      } catch (error) {
        console.error("Error deleting from Firestore:", error);
      }
    } else {
      setMenuItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
    }

    // Sync in cart
    setCartItems((prevCart) => prevCart.filter((cItem) => String(cItem.id) !== String(id)));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  if (view === 'admin') {
    return (
      <Admin
        menuItems={menuItems}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onGoBack={() => { window.location.hash = ''; }}
      />
    );
  }

  return (
    <>
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        cartCount={cartCount}
        openCart={() => setIsCartOpen(true)}
      />

      <main style={{ marginTop: '80px' }}>
        <Hero />
        <About />
        <Menu
          menuItems={menuItems}
          addToCart={addToCart}
          cartItems={cartItems}
          loading={loading}
        />
        <Testimonials />
      </main>

      <Footer />

      {cartCount > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="cart-floating-btn animate-fade-in"
          aria-label="Ver carrito flotante"
          title="Ver carrito de pedido"
        >
          <ShoppingBag size={24} />
          <span className="cart-badge-count">{cartCount}</span>
        </button>
      )}

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <OrderModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        clearCart={clearCart}
      />
    </>
  );
}
