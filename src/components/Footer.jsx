import { Phone, MapPin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand">
            <h3>L'Ambroisie<span className="text-gold">.</span></h3>
            <p>
              Alta cocina para disfrutar en casa. Elaboramos cada pedido al instante con ingredientes frescos y seleccionados.
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
                <span>Calle 85 # 11 - 53, Bogotá, Colombia</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Mail size={18} className="text-gold" />
                <span>reservas@lambroisie.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {currentYear} L'Ambroisie. Todos los derechos reservados.</p>
          <p style={{ fontSize: '0.8rem' }}>
            Diseñado para amantes de la buena mesa.
          </p>
        </div>
      </div>
    </footer>
  );
}
