import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/api';

function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const result = await loginUser(username, password);
      if (result.success) {
        alert('Logged in successfully');
      } else {
        alert('Login failed');
      }
    } else {
      const result = await registerUser(username, password);
      if (result.success) {
        alert('Registered successfully');
      } else {
        alert('Registration failed');
      }
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        Switch to {isLogin ? 'Register' : 'Login'}
      </button>
    </div>
  );
}

export default Home;