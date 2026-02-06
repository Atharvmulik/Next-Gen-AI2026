import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-section">
          <h3 className="logo-text">AI Guide</h3>
          <p className="footer-desc">
            Empowering students with AI-driven academic guidance and emotional support for a brighter future.
          </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul className="horizontal-list">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/guidance">Guidance</Link></li>
            <li><Link to="/counseling">Counseling</Link></li>
            <li><Link to="/trends">Trends</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <ul>
            <li>support@aiguide.com</li>
            <li>+91 98765 43210</li>
            <li>Bangalore, India</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-icons">
            <a href="#"><Twitter size={20} /></a>
            <a href="#"><Linkedin size={20} /></a>
            <a href="#"><Github size={20} /></a>
            <a href="#"><Mail size={20} /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 AI Guidance Platform. All rights reserved.</p>
      </div>
    </footer>
  );
}
