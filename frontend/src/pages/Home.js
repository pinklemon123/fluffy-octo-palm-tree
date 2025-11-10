import React, { useState, useEffect } from 'react';
import { registerUser, loginUser } from '../services/api';
import supabase from '../services/supabase';

function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查是否已登录
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
      } catch (error) {
        console.log('Auth check failed:', error);
      }
    };
    checkAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const result = await loginUser(username, password);
        if (result.success) {
          alert('🎉 登录成功！');
          setIsLoggedIn(true);
          window.location.reload(); // 简单刷新来更新状态
        } else {
          alert('❌ 登录失败：' + (result.error?.message || '未知错误'));
        }
      } else {
        const result = await registerUser(username, password);
        if (result.success) {
          alert('🎉 注册成功！请登录。');
          setIsLogin(true);
        } else {
          alert('❌ 注册失败：' + (result.error?.message || '未知错误'));
        }
      }
    } catch (error) {
      alert('❌ 操作失败：' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      {/* 欢迎区域 - 总是显示 */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(45deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          🌟 FreeChat Forum
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '2rem' }}>
          一个自由的讨论社区，支持文件分享和实时聊天
        </p>
      </div>

      {isLoggedIn ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <h2>🎉 欢迎回来！</h2>
          <p>您已成功登录，可以开始使用论坛功能了。</p>
          <div style={{ marginTop: '1rem' }}>
            <a href="/forum" style={{ margin: '0 1rem', padding: '0.5rem 1rem', background: '#3498db', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              💬 进入讨论区
            </a>
            <a href="/profile" style={{ margin: '0 1rem', padding: '0.5rem 1rem', background: '#2ecc71', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
              👤 个人资料
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="form-container">
            <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
              {isLogin ? '🔐 登录到论坛' : '✨ 加入论坛'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  id="username"
                  type="text"
                  placeholder="输入您的用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input
                  id="password"
                  type="password"
                  placeholder="输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? (
                  <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 auto' }}></div>
                ) : (
                  isLogin ? '🚀 登录' : '🎯 注册'
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button
                onClick={() => setIsLogin(!isLogin)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3498db',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
                disabled={loading}
              >
                {isLogin ? '还没有账号？点击注册' : '已有账号？点击登录'}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h3>🎯 论坛特色</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
              <div className="card">
                <h4>📁 文件上传</h4>
                <p>支持上传HTML、文档、图片、PDF等多种格式文件</p>
              </div>
              <div className="card">
                <h4>💬 实时讨论</h4>
                <p>与其他用户实时交流，分享想法和资源</p>
              </div>
              <div className="card">
                <h4>👤 虚拟身份</h4>
                <p>无需邮箱验证，保护您的隐私和匿名性</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Home;