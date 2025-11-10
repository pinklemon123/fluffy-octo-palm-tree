import React, { useState, useEffect } from 'react';
import { sendMessage, fetchMessages } from '../services/api';
import supabase from '../services/supabase';

function Forum() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMessages();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMessages = async () => {
    const result = await fetchMessages();
    if (result.success) {
      setMessages(result.messages);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    // Assume userId is 1 for demo - in real app, get from auth
    const userId = 1;
    const result = await sendMessage(userId, newMessage);
    if (result.success) {
      setNewMessage('');
    } else {
      alert('发送失败：' + (result.error?.message || '未知错误'));
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
        💬 实时讨论区
      </h2>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>发送消息</h3>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="分享您的想法..."
          style={{ minHeight: '80px', resize: 'vertical' }}
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || !newMessage.trim()}
          style={{ marginTop: '0.5rem' }}
        >
          {loading ? '发送中...' : '🚀 发送消息'}
        </button>
      </div>

      <div>
        <h3>最新消息</h3>
        {messages.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#7f8c8d' }}>
            <p>📭 还没有消息，快来开启第一次讨论吧！</p>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className="message fade-in">
              <img
                src={msg.users?.avatar_url || 'https://via.placeholder.com/40?text=👤'}
                alt="Avatar"
                className="avatar"
              />
              <div className="message-content">
                <div className="message-author">{msg.users?.username || '匿名用户'}</div>
                <div className="message-time">
                  {new Date(msg.created_at).toLocaleString()}
                </div>
                <div>{msg.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Forum;