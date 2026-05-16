'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@ai-sdk/react';
import { useAppStore } from '@/lib/store';
import { ChatInterface } from '@/components/chat-interface';
import {
  getCurrentConversation,
  getChatConversations,
  createConversation,
  deleteConversation,
  addMessageToConversation,
  getProfile,
  updateProfile,
} from '@/lib/storage';
import type { ChatMessage, ChatConversation } from '@/lib/storage';
import { chatModes } from '@/lib/ai-prompts';
import type { ChatMode } from '@/lib/ai-prompts';
import { MessageCircle, RotateCcw, Trash2 } from 'lucide-react';

export default function ChatPage() {
  const { currentEmotion, chatMode, setChatMode } = useAppStore();
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [allConversations, setAllConversations] = useState<ChatConversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [psychProfile, setPsychProfile] = useState<string>('');

  // Initialize with local storage messages
  const { messages, sendMessage, setMessages, isLoading } = useChat({
    api: '/api/chat',
    body: {
      mode: chatMode,
      emotion: currentEmotion,
      profile: psychProfile,
    },
    onFinish: async (message) => {
      if (conversation) {
        addMessageToConversation(conversation.id, {
          role: 'assistant',
          content: message.content,
        });
      }

      // Trigger background profile analysis every ~6 messages
      if (messages.length > 0 && messages.length % 6 === 0) {
        try {
          const res = await fetch('/api/analyze-profile', {
            method: 'POST',
            body: JSON.stringify({ messages: messages.slice(-10) }),
          });
          const data = await res.json();
          if (data.profile) {
            setPsychProfile(data.profile);
            updateProfile({ psychologicalProfile: data.profile });
          }
        } catch (e) {
          console.error('Error analyzing profile', e);
        }
      }
    },
  });

  // Load conversation on mount
  useEffect(() => {
    let conv = getCurrentConversation();
    if (!conv) {
      conv = createConversation(chatMode);
    }
    setConversation(conv);
    
    // Load profile
    const userProfile = getProfile();
    if (userProfile?.psychologicalProfile) {
      setPsychProfile(userProfile.psychologicalProfile);
    }
    
    // Load all conversations
    setAllConversations(getChatConversations());
    
    // Convert local storage messages to useChat format if needed
    const initialMessages = conv.messages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    setMessages(initialMessages);
  }, [setMessages]);

  const handleSendMessage = useCallback((content: string) => {
    if (!conversation) return;

    // Save user message to local storage
    addMessageToConversation(conversation.id, {
      role: 'user',
      content,
    });

    // useChat handle the rest via its own state
  }, [conversation]);

  const handleNewConversation = () => {
    const newConv = createConversation(chatMode);
    setConversation(newConv);
    setMessages([]);
    setAllConversations(getChatConversations());
  };

  const handleDeleteConversation = () => {
    if (conversation) {
      deleteConversation(conversation.id);
      handleNewConversation();
    }
  };

  const handleSelectConversation = (conv: ChatConversation) => {
    setConversation(conv);
    setChatMode(conv.mode);
    setMessages(conv.messages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })));
    setShowHistory(false);
  };

  const handleModeChange = (mode: ChatMode) => {
    setChatMode(mode);
  };

  return (
    <div className="h-[calc(100vh-6rem)] md:h-screen flex flex-col max-w-3xl mx-auto relative overflow-hidden rounded-3xl">
      {/* Off-canvas History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-background/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="absolute top-0 left-0 h-full w-[85%] max-w-sm glass-strong z-50 border-r border-white/10 flex flex-col p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Tus Chats</h2>
                <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-white/5 transition-all text-muted-foreground">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <button
                onClick={handleNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all mb-6"
              >
                <RotateCcw className="w-4 h-4" />
                Iniciar Nuevo Chat
              </button>

              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-2">Recientes</p>
              <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                {allConversations.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-4 py-3 rounded-2xl text-sm transition-all flex flex-col ${
                      conversation?.id === conv.id 
                        ? 'bg-primary/20 text-primary border border-primary/20 shadow-inner' 
                        : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground glass'
                    }`}
                  >
                    <span className="truncate w-full font-medium">
                      {conv.messages[0]?.content.substring(0, 35) || 'Conversación vacía...'}
                    </span>
                    <span className="text-[10px] opacity-60 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </span>
                  </button>
                ))}
                {allConversations.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center mt-8">No tienes chats guardados.</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 glass-strong md:border md:border-white/5 md:rounded-3xl overflow-hidden relative">
        {/* Header */}
        <div className="shrink-0 px-4 py-4 border-b border-white/5 bg-background/30 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(true)}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground hover:bg-white/10 transition-all active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center hidden sm:flex">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-foreground">Chat de apoyo</h1>
              <p className="text-[10px] sm:text-xs text-primary/80 uppercase tracking-widest font-bold">
                {chatModes[chatMode].name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteConversation}
              className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-all"
              title="Borrar conversación"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Mode selector (Pills) */}
        <div className="flex gap-2 p-3 overflow-x-auto border-b border-white/5 bg-background/20 scrollbar-hide shrink-0">
          {(Object.keys(chatModes) as ChatMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => handleModeChange(mode)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                chatMode === mode
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{chatModes[mode].icon}</span>
              <span>{chatModes[mode].name}</span>
            </button>
          ))}
        </div>

        {/* Chat Interface */}
        <div className="flex-1 min-h-0 relative">
          <ChatInterface
            messages={messages as any}
            onSendMessage={(content) => {
              try {
                handleSendMessage(content);
                sendMessage({ role: 'user', content });
              } catch (error) {
                console.error("Append error:", error);
              }
            }}
            isTyping={isLoading}
            placeholder={
              chatMode === 'silent'
                ? 'Solo estar aquí...'
                : chatMode === 'listener'
                  ? 'Cuéntame lo que quieras...'
                  : 'Escribe lo que sientes...'
            }
          />
        </div>
      </div>
    </div>
  );
}
