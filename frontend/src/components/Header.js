import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="header">
      <h1>Forum App</h1>
      <nav>
        <Link to="/">Home</Link> | 
        <Link to="/profile">Profile</Link> | 
        <Link to="/forum">Forum</Link> | 
        <Link to="/messages">Messages</Link>
      </nav>
    </header>
  );
}

export default Header;