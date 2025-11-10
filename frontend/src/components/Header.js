import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <h1>🌟 FreeChat Forum</h1>
      <nav>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>🏠 Home</Link>
        <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>👤 Profile</Link>
        <Link to="/forum" className={location.pathname === '/forum' ? 'active' : ''}>💬 Forum</Link>
        <Link to="/messages" className={location.pathname === '/messages' ? 'active' : ''}>📨 Messages</Link>
      </nav>
    </header>
  );
}

export default Header;