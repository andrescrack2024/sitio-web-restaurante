import { Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.png" alt="" style={{ height: '32px', width: '32px', borderRadius: '50%', objectFit: 'contain' }} />
              Rápido & Deli
            </h3>
            <p>
              Comida rápida artesanal y helados gourmet para disfrutar en casa. Elaboramos cada pedido al instante con ingredientes frescos.
            </p>
            <div className="social-links">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="btn-icon-round" aria-label="Instagram">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="btn-icon-round" aria-label="Facebook">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="footer-title">Horarios de Atención</h4>
            <ul className="footer-hours-list">
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Lunes a Jueves:</span>
                <span className="text-gold">12:00 PM - 10:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Viernes y Sábados:</span>
                <span className="text-gold">12:00 PM - 11:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Domingos:</span>
                <span className="text-gold">12:00 PM - 9:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="footer-title">Contacto & Domicilios</h4>
            <ul className="footer-contact-list">
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Phone size={18} className="text-gold" />
                <span>+57 312 660 2583</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MapPin size={18} className="text-gold" />
                <span>Carrera 3 # 24 - 45, Quibdó, Chocó, Colombia</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} className="text-gold" />
                <span>domicilios@rapidoydeli.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <p>&copy; {currentYear} Rápido & Deli. Todos los derechos reservados.</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            Desarrollado con tecnología optimizada por <strong>Sharly Mosquera - Ingeniería de Sistemas</strong>
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>
            Comida Rápida • Sabor al Instante
          </p>
        </div>
      </div>
    </footer>
  );
}
