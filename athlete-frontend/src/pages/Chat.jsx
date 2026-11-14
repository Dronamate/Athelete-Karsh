import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const role = sessionStorage.getItem('user_role');
  const myUsername = sessionStorage.getItem('user_name');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    
    // Check if we came from dashboard with a conversation ID
    const urlParams = new URLSearchParams(window.location.search);
    const convId = urlParams.get('conversationId');
    if (convId) {
      // It will be selected once conversations are fetched
    }
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const convId = urlParams.get('conversationId');
    if (convId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === parseInt(convId));
      if (conv) setActiveChat(conv);
    }
  }, [conversations]);

  // Listen for real-time messages via WebSocket
  useEffect(() => {
    let ws;
    if (activeChat) {
      // 1. Fetch initial history
      fetchMessages(activeChat.id);

      // 2. Open WebSocket
      // Use dynamic WS URL
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || `${wsProtocol}//127.0.0.1:8000`;
      const wsUrl = `${wsBaseUrl}/ws/chat/${activeChat.id}/`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
          setMessages(prev => {
            // Prevent duplicate messages if REST API just fetched it
            if (prev.find(m => m.id === data.message.id)) return prev;
            return [...prev, data.message];
          });
          setTimeout(scrollToBottom, 100);
        }
      };

      ws.onclose = () => console.log('WebSocket disconnected');
    }

    return () => {
      if (ws) ws.close();
    };
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('conversations/');
      setConversations(response.data.results || response.data);
    } catch (error) { console.error("Error fetching conversations", error); }
  };

  const fetchMessages = async (convId) => {
    try {
      const response = await api.get(`messages/?conversation=${convId}`);
      setMessages(response.data.results || response.data);
      setTimeout(scrollToBottom, 100);
    } catch (error) { console.error("Error fetching messages", error); }
  };



  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await api.post('messages/', {
        conversation: activeChat.id,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages(activeChat.id);
      fetchConversations(); // Update latest message in sidebar
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const getChatPartner = (conv) => {
    return role === 'ATHLETE' ? conv.professional : conv.athlete;
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-64px)] flex bg-white border-l border-r border-slate-200 shadow-sm overflow-x-hidden w-full max-w-[100vw]">
      
      {/* Sidebar: Conversations List */}
      <div className={`w-full md:w-1/3 border-r border-slate-200 flex flex-col bg-slate-50 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 font-display">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No active conversations.</div>
          ) : (
            conversations.map(conv => {
              const partner = getChatPartner(conv);
              const isActive = activeChat?.id === conv.id;
              return (
                <div 
                  key={conv.id} 
                  onClick={() => setActiveChat(conv)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition ${isActive ? 'bg-orange-50 border-l-4 border-l-[#ff5500]' : 'hover:bg-slate-100 border-l-4 border-l-transparent'}`}
                >
                  <h3 className="font-bold text-[#0c2340] font-display">{partner?.username || 'Unknown User'}</h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {conv.latest_message ? conv.latest_message.content : 'No messages yet'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10 flex items-center">
              <button
                type="button"
                onClick={() => setActiveChat(null)}
                className="md:hidden mr-3 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm"
                title="Back to conversations"
              >
                ← Back
              </button>
              <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-[#ff5500] font-bold text-lg mr-3 font-display">
                {getChatPartner(activeChat)?.username.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-lg font-bold text-[#0c2340] font-display">{getChatPartner(activeChat)?.username}</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, index) => {
                const isMe = msg.sender.username === myUsername;
                const showAvatar = !isMe && (index === 0 || messages[index - 1].sender.username !== msg.sender.username);
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end mb-4`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[#ff5500] font-bold text-xs mr-2 flex-shrink-0 font-display">
                        {showAvatar ? msg.sender.username.charAt(0).toUpperCase() : ''}
                      </div>
                    )}
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 relative shadow-sm ${
                      isMe 
                        ? 'bg-[#ff5500] text-white rounded-br-sm' 
                        : 'bg-white border border-slate-200 text-[#0c2340] rounded-bl-sm'
                    }`}>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-orange-100' : 'text-slate-400'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSendMessage} className="flex space-x-3 items-center">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..." 
                  className="flex-1 px-4 py-2.5 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:bg-white focus:border-[#ff5500] text-xs sm:text-sm text-[#0c2340] transition"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-[#ff5500] text-white h-10 w-10 rounded-full flex items-center justify-center font-bold hover:bg-[#ea4c00] disabled:opacity-50 transition shadow-sm shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50">
            <div className="text-slate-300 text-5xl mb-3">💬</div>
            <h2 className="text-xl font-bold text-[#0c2340] mb-1 font-display">Your Messages</h2>
            <p className="text-slate-500 text-xs sm:text-sm text-center max-w-md">
              Select a conversation from the left to start chatting with your coach or athlete.
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
}
