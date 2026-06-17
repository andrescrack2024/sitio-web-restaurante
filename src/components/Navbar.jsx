import { ShoppingBag, Sun, Moon, Menu as MenuIcon, X, HelpCircle } from 'lucide-react';

export default function Navbar({ theme, toggleTheme, cartCount, openCart, startTour }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Nosotros', href: '#nosotros' },
    { label: 'Menú', href: '#menu' },
    { label: 'Testimonios', href: '#testimonios' },
    { label: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-container">
        <a href="#inicio" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo.png" alt="Rápido & Deli Logo" style={{ height: '42px', width: '42px', objectFit: 'contain', borderRadius: '50%' }} />
          <span>Rápido & Deli</span>
        </a>

        {/* Desktop & Mobile Navigation Links */}
        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions (Cart, Theme, Mobile toggle) */}
        <div className="nav-actions">
          {/* Onboarding Guide Toggle */}
          <button
            onClick={startTour}
            className="btn-icon-round"
            aria-label="Ver guía de uso"
            title="Guía de uso"
          >
            <HelpCircle size={20} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn-icon-round"
            aria-label="Cambiar tema"
            title="Cambiar tema"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="btn-icon-round"
            style={{ position: 'relative' }}
            aria-label="Ver carrito"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="cart-badge-count animate-fade-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
            aria-label="Menú móvil"
          >
            {mobileMenuOpen ? (
              <X size={24} style={{ color: 'var(--text-primary)' }} />
            ) : (
              <>
                <span></span>
                <span></span>
                <span></span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
