import React, { useState, useEffect } from 'react';
import { fetchMessages } from '../services/api';

function Messages() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages().then(result => {
      if (result.success) {
        setMessages(result.messages);
      }
    });
  }, []);

  return (
    <div>
      <h2>Messages</h2>
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

export default Messages;