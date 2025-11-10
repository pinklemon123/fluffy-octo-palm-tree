import React, { useState, useEffect } from 'react';
import { sendMessage, fetchMessages } from '../services/api';
import supabase from '../services/supabase';

function Forum() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchMessages().then(result => {
      if (result.success) {
        setMessages(result.messages);
      }
    });

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

  const handleSendMessage = async () => {
    // Assume userId is 1 for demo
    const userId = 1;
    const result = await sendMessage(userId, newMessage);
    if (result.success) {
      setNewMessage('');
    }
  };

  return (
    <div>
      <h2>Forum Discussion</h2>
      <div>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message"
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
      <div>
        {messages.map(msg => (
          <div key={msg.id} className="message">
            <img src={msg.users.avatar_url} alt="Avatar" className="avatar" />
            <strong>{msg.users.username}</strong>: {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Forum;