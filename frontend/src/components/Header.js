import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  return (
    <header className="header">
      <div>
        <h1>🌟 FreeChat Forum</h1>
        <p className="header-tagline">连接想法、分享文件，和社区一起闪耀</p>
      </div>
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