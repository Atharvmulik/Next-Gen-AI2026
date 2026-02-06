import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Guidance', path: '/guidance' },
    { name: 'Counseling', path: '/counseling' },
    { name: 'Task Keeper', path: '/tasks' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo">
          <Rocket className="logo-icon" size={24} />
          <span>AI Guide</span>
        </Link>

        {/* Desktop Menu */}
        <ul className="nav-links desktop-only">
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                className={isActive(link.path) ? 'active' : ''}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions desktop-only">
          
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </button>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="mobile-menu glass">
            <ul className="mobile-links">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={isActive(link.path) ? 'active' : ''}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <div className="mobile-actions">
                
              </div>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
