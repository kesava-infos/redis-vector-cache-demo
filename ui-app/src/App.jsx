import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatFeed from './components/ChatFeed';
import ChatInput from './components/ChatInput';
import VectorInspectorModal from './components/VectorInspectorModal';
import SettingsModal from './components/SettingsModal';
import { sendChatMessage } from './services/chatService';
import './App.css';

export default function App() {
  const [chats, setChats] = useState([
    {
      id: 'session_1',
      title: 'Redis Vector Search Demo',
      messages: []
    }
  ]);
  const [activeChatId, setActiveChatId] = useState('session_1');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inspectingMessage, setInspectingMessage] = useState(null);

  // Settings & Controls
  const [similarityThreshold, setSimilarityThreshold] = useState(0.85);
  const [bypassCache, setBypassCache] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000/api/chat');
  const [isLoading, setIsLoading] = useState(false);

  // Telemetry Aggregates
  const [telemetry, setTelemetry] = useState({
    totalQueries: 0,
    cacheHits: 0,
    hitRate: 0,
    avgLatencySaved: 815,
    costSaved: 0.00
  });

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = async (promptText) => {
    if (!promptText.trim()) return;

    const userMsg = {
      id: 'msg_u_' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toISOString()
    };

    // Update session title if first prompt
    const isFirstMessage = activeChat.messages.length === 0;
    const updatedTitle = isFirstMessage
      ? promptText.slice(0, 28) + (promptText.length > 28 ? '...' : '')
      : activeChat.title;

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
            ...c,
            title: updatedTitle,
            messages: [...c.messages, userMsg]
          }
          : c
      )
    );

    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        prompt: promptText,
        conversationId: activeChatId,
        similarityThreshold,
        bypassCache,
        backendUrl,
        selectedModel
      });

      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: [...c.messages, response] }
            : c
        )
      );

      // Update Telemetry
      setTelemetry((prev) => {
        const totalQueries = prev.totalQueries + 1;
        const cacheHits = prev.cacheHits + (response.isCacheHit ? 1 : 0);
        const hitRate = Math.round((cacheHits / totalQueries) * 100);
        const costSaved = prev.costSaved + (response.costSavedUsd || 0);

        return {
          totalQueries,
          cacheHits,
          hitRate,
          avgLatencySaved: 815,
          costSaved
        };
      });
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newId = 'session_' + Date.now();
    const newChat = {
      id: newId,
      title: 'New Conversation',
      messages: []
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newId);
  };

  const handleDeleteChat = (chatId) => {
    if (chats.length <= 1) return;
    const filtered = chats.filter((c) => c.id !== chatId);
    setChats(filtered);
    if (activeChatId === chatId) {
      setActiveChatId(filtered[0].id);
    }
  };

  const handleResetTelemetry = () => {
    setTelemetry({
      totalQueries: 0,
      cacheHits: 0,
      hitRate: 0,
      avgLatencySaved: 815,
      costSaved: 0.0
    });
  };

  return (
    <div className="app-container">
      <Header
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        telemetry={telemetry}
      />

      <div className="main-body">
        <Sidebar
          isOpen={isSidebarOpen}
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          telemetry={telemetry}
          similarityThreshold={similarityThreshold}
          onThresholdChange={setSimilarityThreshold}
        />

        <main className="chat-container">
          <ChatFeed
            messages={activeChat.messages}
            isLoading={isLoading}
            onSelectPrompt={handleSendMessage}
            onInspectVector={setInspectingMessage}
          />

          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            bypassCache={bypassCache}
            onToggleBypass={setBypassCache}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
        </main>
      </div>

      {/* Vector Match Inspector Modal */}
      <VectorInspectorModal
        message={inspectingMessage}
        onClose={() => setInspectingMessage(null)}
      />

      {/* Configuration Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        backendUrl={backendUrl}
        onSaveBackendUrl={setBackendUrl}
        similarityThreshold={similarityThreshold}
        onThresholdChange={setSimilarityThreshold}
        onResetTelemetry={handleResetTelemetry}
      />
    </div>
  );
}
