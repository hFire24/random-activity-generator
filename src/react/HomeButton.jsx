import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const HomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show on home page
  if (location.pathname === '/') {
    return null;
  }
  
  return (
    <button 
      className="home-button" 
      onClick={() => navigate('/')}
      title="Go to Home"
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
        transition: 'all 0.3s ease'
      }}
    >
      🏠
    </button>
  );
};

export default HomeButton;
