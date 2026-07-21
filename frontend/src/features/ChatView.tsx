import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Pin, Trash2, StopCircle, Sparkles, Copy, Download, RefreshCw } from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const ChatView: React.FC = () => {
  const {
    chats,
    activeChat,
    activeChatId,
    isStreaming,
    streamingMessage,
    fetchChats,
    selectChat,
    createNewChat,
    sendMessage,
    togglePinChat,
    deleteChat,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [selectedMode, setSelectedMode] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, streamingMessage]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    const msg = input;
    setInput('');
    sendMessage(msg, selectedMode);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (text: string, title = 'senseai_chat') => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const MODES = [
    { id: 'chat', label: 'General AI' },
    { id: 'troubleshoot', label: 'Troubleshoot' },
    { id: 'code', label: 'Code Assist' },
    { id: 'learning', label: 'Learn Concept' },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-sm">
      {/* Internal History Drawer */}
      <div className="w-64 bg-surface-raised border-r border-border-subtle flex flex-col hidden sm:flex">
        <div className="p-3 border-b border-border-subtle flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-tertiary">Conversations</span>
          <button
            onClick={createNewChat}
            className="flex items-center space-x-1 text-xs bg-accent-primary text-white px-2.5 py-1 rounded-lg hover:bg-accent-hover transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chats.map((c) => (
            <div
              key={c.id}
              onClick={() => selectChat(c.id)}
              className={`group flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                activeChatId === c.id ? 'bg-accent-primary/10 text-accent-primary font-semibold' : 'text-text-secondary hover:bg-surface'
              }`}
            >
              <span className="truncate flex-1 pr-2">{c.title}</span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinChat(c.id);
                  }}
                  className="p-1 hover:text-accent-primary"
                  title={c.pinned ? 'Unpin' : 'Pin'}
                >
                  <Pin className={`w-3 h-3 ${c.pinned ? 'fill-accent-primary text-accent-primary' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(c.id);
                  }}
                  className="p-1 hover:text-semantic-danger"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="text-center text-xs text-text-tertiary py-8">No saved conversations</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mode Selector Chips */}
        <div className="px-4 py-2 border-b border-border-subtle bg-surface flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-text-tertiary">Mode:</span>
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedMode === m.id
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'bg-surface-raised text-text-secondary hover:text-text-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {!activeChat?.messages?.length && !isStreaming && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="p-4 rounded-full bg-accent-primary/10 text-accent-primary mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-text-primary mb-2">How can SenseAI assist your engineering workflow today?</h2>
              <p className="text-xs text-text-tertiary max-w-md">
                Ask about sensor pin configs, debug hardware NaN readings, compare protocol stacks, or generate compilable ESP32/Arduino code.
              </p>
            </div>
          )}

          {activeChat?.messages?.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-3xl rounded-2xl p-4 text-sm ${
                  msg.role === 'user'
                    ? 'bg-accent-primary text-white rounded-br-none'
                    : 'bg-surface-raised border border-border-subtle text-text-primary rounded-bl-none'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <MarkdownRenderer content={msg.content} />
                )}
              </div>

              {/* Action Toolbar for AI responses */}
              {msg.role === 'assistant' && (
                <div className="flex items-center space-x-2 mt-1 px-1 text-xs text-text-tertiary">
                  <button
                    onClick={() => handleCopy(msg.content)}
                    className="hover:text-text-primary flex items-center space-x-1 p-1 rounded hover:bg-surface-raised"
                    title="Copy response"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => handleDownload(msg.content, activeChat?.title)}
                    className="hover:text-text-primary flex items-center space-x-1 p-1 rounded hover:bg-surface-raised"
                    title="Download Markdown"
                  >
                    <Download className="w-3 h-3" />
                    <span>Markdown</span>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Streaming Response Token Bubble */}
          {isStreaming && (
            <div className="flex flex-col items-start">
              <div className="max-w-3xl rounded-2xl p-4 text-sm bg-surface-raised border border-border-subtle text-text-primary rounded-bl-none">
                <MarkdownRenderer content={streamingMessage || 'Thinking...'} isStreaming={true} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-border-subtle bg-surface">
          <div className="flex items-center bg-surface-raised border border-border-subtle rounded-xl px-3 py-2 focus-within:border-accent-primary/60 transition-colors">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask an IIoT engineering question (e.g. DHT22 NaN reading, ESP32 deep sleep, Modbus RS-485...)"
              className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-tertiary resize-none max-h-32 min-h-[2.5rem]"
              rows={1}
            />
            {isStreaming ? (
              <button
                type="button"
                className="p-2 text-semantic-danger hover:opacity-80 transition-opacity"
                title="Stop generation"
              >
                <StopCircle className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2 text-accent-primary disabled:text-text-tertiary/40 hover:opacity-80 transition-opacity"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
