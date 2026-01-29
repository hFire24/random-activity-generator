import React from 'react';

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
        <a href="/terms">Terms of Use</a>
        <span className="footer-separator">•</span>
        <a href="/privacy">Privacy Policy</a>
      </div>
    </footer>
  );
};

export default Footer;
