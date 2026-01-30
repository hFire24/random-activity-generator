import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <a 
          href="https://github.com/hFire24/random-activity-generator" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span className="footer-separator">•</span>
        <Link to="/terms">Terms of Use</Link>
        <span className="footer-separator">•</span>
        <Link to="/privacy">Privacy Policy</Link>
      </div>
    </footer>
  );
};

export default Footer;
