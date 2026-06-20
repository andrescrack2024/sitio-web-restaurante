import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Menu, { MENU_ITEMS } from './components/Menu';
import Cart from './components/Cart';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Admin from './components/Admin';
import OnboardingTour from './components/OnboardingTour';
import OrderModal from './components/OrderModal';
import { db, isFirebaseSupported } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ShoppingBag } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [menuItems, setMenuItems] = useState(() => {
    try {
      const saved = localStorage.getItem('rapidoydeli_menu');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage read error:', e);
    }
    return isFirebaseSupported ? [] : MENU_ITEMS;
  });
  const [loading, setLoading] = useState(isFirebaseSupported);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const [adminHash, setAdminHash] = useState(() => {
    try {
      const saved = localStorage.getItem('rapidoydeli_admin_hash');
      return saved || 'admin_chocquin_9924';
    } catch (e) {
      return 'admin_chocquin_9924';
    }
  });

  const [adminSettings, setAdminSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('rapidoydeli_admin_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage read error for admin settings:', e);
    }
    return {
      password: 'admin123',
      securityQuestion: '¿Cuál es el nombre de tu cliente principal?',
      securityAnswer: 'edwin',
      secureHash: 'admin_chocquin_9924',
      adminEmail: 'sharlyandresmosquerarodriguez@gmail.com',
      emailjsServiceId: '',
      emailjsTemplateId: '',
      emailjsPublicKey: '',
      audioNotifications: true,
      voiceNotifications: true
    };
  });

  const [view, setView] = useState(() => {
    const currentHash = window.location.hash.replace('#', '');
    try {
      const saved = localStorage.getItem('rapidoydeli_admin_hash') || 'admin_chocquin_9924';
      return currentHash === saved ? 'admin' : 'shop';
    } catch (e) {
      return currentHash === 'admin_chocquin_9924' ? 'admin' : 'shop';
    }
  });

  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourDismissed, setTourDismissed] = useState(false);
  const [hasAddedToCart, setHasAddedToCart] = useState(false);
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('rapidoydeli_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('LocalStorage orders read error:', e);
    }
    return [];
  });

  // Auto-open tour for new users on page load
  useEffect(() => {
    if (view === 'shop') {
      let tourCompleted = false;
      try {
        tourCompleted = localStorage.getItem('rapido_deli_tour_completed_v6') === 'true';
      } catch (e) {
        console.warn('LocalStorage not supported:', e);
      }
      
      if (!tourCompleted) {
        const timer = setTimeout(() => {
          setTourStep(0);
          setIsTourOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [view]);
  
  // Ref to ensure migration check runs exactly once when component mounts
  const migrationCheckedRef = useRef(false);
  const processedOrderIdsRef = useRef(null);
  const initialLoadTimeRef = useRef(Date.now());

  const playAlertChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      playTone(523.25, audioCtx.currentTime, 0.3); // C5 (Ping)
      playTone(659.25, audioCtx.currentTime + 0.15, 0.4); // E5 (Pong)
    } catch (e) {
      console.warn("Failed to play audio alert:", e);
    }
  };

  const speakNotification = (text) => {
    try {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Failed to announce with Text-To-Speech:", e);
    }
  };

  const triggerOrderNotification = (order) => {
    const audioEnabled = adminSettings?.audioNotifications !== false;
    const voiceEnabled = adminSettings?.voiceNotifications !== false;

    if (audioEnabled) {
      playAlertChime();
    }

    if (voiceEnabled) {
      speakNotification(`Nuevo pedido recibido de ${order.clientName || 'cliente'}`);
    }
  };

  // Handle hash-based routing for admin panel
  useEffect(() => {
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash === adminHash) {
        setView('admin');
      } else {
        setView('shop');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [adminHash]);

  // Subscribe to config/admin_settings in Firestore
  useEffect(() => {
    if (!isFirebaseSupported) return;

    const docRef = doc(db, 'config', 'admin_settings');
    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAdminSettings(data);
        if (data.secureHash) {
          setAdminHash(data.secureHash);
          try {
            localStorage.setItem('rapidoydeli_admin_hash', data.secureHash);
          } catch(e){}
        }
        try {
          localStorage.setItem('rapidoydeli_admin_settings', JSON.stringify(data));
        } catch(e){}
      } else {
        // Seed default admin configuration
        const defaultSettings = {
          password: 'admin123',
          securityQuestion: '¿Cuál es el nombre de tu cliente principal?',
          securityAnswer: 'edwin',
          secureHash: 'admin_chocquin_9924',
          adminEmail: 'sharlyandresmosquerarodriguez@gmail.com',
          emailjsServiceId: '',
          emailjsTemplateId: '',
          emailjsPublicKey: '',
          audioNotifications: true,
          voiceNotifications: true
        };
        try {
          await setDoc(docRef, defaultSettings);
          console.log("Configuración inicial de administrador sembrada en Firestore.");
        } catch (e) {
          console.error("Error al sembrar configuración en Firestore:", e);
        }
      }
    }, (error) => {
      console.error("Error al cargar configuración de Firestore:", error);
    });

    return () => unsubscribe();
  }, []);

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auto-dismiss cart hint when cart is opened
  useEffect(() => {
    if (isCartOpen) {
      setHasAddedToCart(false);
    }
  }, [isCartOpen]);

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

        const hasOldCategories = items.some(item => 
          item.category === 'rapida' || 
          item.category === 'acompanamientos' || 
          item.category === 'helados' ||
          item.name === 'Hamburguesa Clásica con Queso'
        );
        const hasOutdatedImages = items.some(item => 
          item.image && item.image.includes('w=800')
        );
        const missingIngredients = items.length > 0 && !items.some(item => item.ingredients && item.ingredients.length > 0);

        if (hasOldCategories || hasOutdatedImages || missingIngredients || items.length === 0) {
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
      try {
        localStorage.setItem('rapidoydeli_menu', JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage write error:', e);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore loading error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to orders in real-time or handle local fallback
  useEffect(() => {
    if (!isFirebaseSupported) {
      localStorage.setItem('rapidoydeli_orders', JSON.stringify(orders));
      return;
    }

    const ordersCollection = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
      const items = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });

      // Trigger audio & voice notifications for new orders
      if (processedOrderIdsRef.current !== null) {
        const newOrders = items.filter(order => 
          !processedOrderIdsRef.current.has(order.id) && 
          order.status === 'pendiente' &&
          new Date(order.createdAt).getTime() > initialLoadTimeRef.current - 10000
        );

        if (newOrders.length > 0) {
          newOrders.forEach(order => {
            triggerOrderNotification(order);
          });
        }
      }
      processedOrderIdsRef.current = new Set(items.map(o => o.id));

      // Sort by date descending (newest first)
      items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(items);
      try {
        localStorage.setItem('rapidoydeli_orders', JSON.stringify(items));
      } catch (e) {
        console.warn('LocalStorage write error:', e);
      }
    }, (error) => {
      console.error("Firestore loading orders error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handlePlaceOrder = async (orderData) => {
    const newOrder = {
      ...orderData,
      id: String(Date.now()),
      createdAt: new Date().toISOString()
    };

    if (isFirebaseSupported) {
      try {
        const ordersCol = collection(db, 'orders');
        const newOrderRef = doc(ordersCol);
        await setDoc(newOrderRef, {
          ...orderData,
          id: newOrderRef.id,
          createdAt: new Date().toISOString()
        });
        console.log("Pedido guardado en Firestore:", newOrderRef.id);
      } catch (error) {
        console.error("Error al guardar pedido en Firestore:", error);
      }
    } else {
      setOrders((prev) => [newOrder, ...prev]);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (isFirebaseSupported) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(orderRef, { status: newStatus }, { merge: true });
      } catch (error) {
        console.error("Error al actualizar estado del pedido en Firestore:", error);
      }
    } else {
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))
      );
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("¿Está seguro de que desea eliminar este pedido del historial?")) {
      if (isFirebaseSupported) {
        try {
          await deleteDoc(doc(db, 'orders', orderId));
        } catch (error) {
          console.error("Error al eliminar pedido en Firestore:", error);
        }
      } else {
        setOrders((prev) => prev.filter((order) => order.id !== orderId));
      }
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToCart = (item, selectedSauces = []) => {
    const isCustomizable = item.category === 'hamburguesas' || item.category === 'perros' || item.category === 'salchipapas';
    const sauces = isCustomizable ? [...selectedSauces].sort() : [];
    const cartKey = `${item.id}-${sauces.join(',')}`;

    setCartItems((prevItems) => {
      const existing = prevItems.find((i) => i.cartKey === cartKey);
      if (existing) {
        return prevItems.map((i) =>
          i.cartKey === cartKey ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, cartKey, sauces, quantity: 1 }];
    });
    setHasAddedToCart(true);
  };

  const updateCartItemSauces = (cartKey, newSauces) => {
    const sortedSauces = [...newSauces].sort();
    setCartItems((prevItems) => {
      const targetItem = prevItems.find((item) => item.cartKey === cartKey);
      if (!targetItem) return prevItems;

      const newCartKey = `${targetItem.id}-${sortedSauces.join(',')}`;
      const duplicateItem = prevItems.find((item) => item.cartKey === newCartKey && item.cartKey !== cartKey);

      if (duplicateItem) {
        return prevItems
          .map((item) => {
            if (item.cartKey === newCartKey) {
              return { ...item, quantity: item.quantity + targetItem.quantity };
            }
            return item;
          })
          .filter((item) => item.cartKey !== cartKey);
      } else {
        return prevItems.map((item) =>
          item.cartKey === cartKey ? { ...item, cartKey: newCartKey, sauces: sortedSauces } : item
        );
      }
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
  };

  const updateQuantity = (cartKey, amount) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.cartKey === cartKey) {
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



  const handleUpdateAdminSettings = async (newSettings) => {
    setAdminSettings(newSettings);
    if (newSettings.secureHash) {
      setAdminHash(newSettings.secureHash);
      try {
        localStorage.setItem('rapidoydeli_admin_hash', newSettings.secureHash);
      } catch (e) {}
    }
    try {
      localStorage.setItem('rapidoydeli_admin_settings', JSON.stringify(newSettings));
    } catch (e) {}

    if (isFirebaseSupported) {
      try {
        const docRef = doc(db, 'config', 'admin_settings');
        await setDoc(docRef, newSettings);
        console.log("Configuración de administración guardada en Firestore.");
      } catch (error) {
        console.error("Error al guardar configuración en Firestore:", error);
      }
    }
  };

  if (view === 'admin') {
    return (
      <Admin
        menuItems={menuItems}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        orders={orders}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onDeleteOrder={handleDeleteOrder}
        onGoBack={() => { window.location.hash = ''; }}
        adminSettings={adminSettings}
        onUpdateAdminSettings={handleUpdateAdminSettings}
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
        startTour={() => {
          setTourDismissed(false);
          setTourStep(0);
          setIsTourOpen(true);
        }}
        hasAddedToCart={hasAddedToCart}
        dismissCartHint={() => setHasAddedToCart(false)}
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

      {!isCartOpen && (
        <a
          id="tour-whatsapp-btn"
          href={cartCount > 0 ? undefined : "https://wa.me/573126602583?text=Hola!%20Quiero%20hacer%20un%20pedido%20en%20R%C3%A1pido%20%26%20Deli%20en%20Quibdó."}
          target={cartCount > 0 ? undefined : "_blank"}
          rel={cartCount > 0 ? undefined : "noopener noreferrer"}
          onClick={cartCount > 0 ? () => setIsCartOpen(true) : undefined}
          className="btn-whatsapp-fixed animate-fade-in"
          title={cartCount > 0 ? "Completar mi pedido por WhatsApp" : "Escríbenos por WhatsApp"}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.592 1.97 14.12 .946 11.5 .946c-5.423 0-9.842 4.37-9.846 9.8.001 1.93.523 3.8 1.511 5.4l-.993 3.625 3.73-.977zm11.536-6.52c-.27-.135-1.595-.788-1.842-.877-.248-.09-.427-.135-.607.135-.179.27-.697.877-.854 1.057-.158.18-.315.202-.586.067-1.18-.592-1.96-1.01-2.735-2.338-.204-.352.204-.326.583-1.085.09-.18.045-.337-.022-.472-.068-.135-.608-1.464-.833-2.005-.22-.529-.462-.458-.63-.466-.153-.008-.329-.01-.505-.01-.176 0-.463.067-.704.326-.241.26-.92.9-.92 2.196 0 1.297.945 2.546 1.077 2.726.133.18 1.861 2.842 4.508 3.982.63.272 1.12.434 1.503.555.632.201 1.21.172 1.665.105.508-.075 1.595-.653 1.82-.1282.225-.63.225-1.17.157-1.26-.068-.09-.248-.135-.518-.27z" />
          </svg>
          <span>{cartCount > 0 ? `Pedir por WhatsApp (${cartCount})` : 'Escríbenos por WhatsApp'}</span>
        </a>
      )}

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        updateCartItemSauces={updateCartItemSauces}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <OrderModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        clearCart={clearCart}
        onPlaceOrder={handlePlaceOrder}
      />

      <OnboardingTour
        isOpen={isTourOpen}
        isCartOpen={isCartOpen}
        isCheckoutOpen={isCheckoutOpen}
        onClose={() => {
          setIsTourOpen(false);
          setIsCartOpen(false);
          setIsCheckoutOpen(false);
          setTourDismissed(true);
        }}
        addToCart={addToCart}
        clearCart={clearCart}
        menuItems={menuItems}
        openCart={() => setIsCartOpen(true)}
        closeCart={() => setIsCartOpen(false)}
        openCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        closeCheckout={() => setIsCheckoutOpen(false)}
        cartCount={cartCount}
        cartItems={cartItems}
        step={tourStep}
        setStep={setTourStep}
      />
    </>
  );
}
