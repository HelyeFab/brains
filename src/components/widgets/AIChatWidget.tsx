import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/useChatStore';
import { useUIStore } from '@/stores/useUIStore';
import { useOllamaModels, useOllamaStatus } from '@/hooks/useOllama';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Bot,
  Plus,
  Send,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  StopCircle,
  MessageSquare,
  Download,
  ChevronDown,
  Copy,
  Check as CheckIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import remarkGfm from 'remark-gfm';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/hljs/typescript';
import python from 'react-syntax-highlighter/dist/cjs/languages/hljs/python';
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import css from 'react-syntax-highlighter/dist/cjs/languages/hljs/css';
import xml from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml';

// Register languages for syntax highlighting
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', xml);
SyntaxHighlighter.registerLanguage('xml', xml);
import {
  generateChatResponse,
  formatModelSize,
} from '@/lib/ollama';
import type { OllamaModel, ChatMessage } from '@/types';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Popover from '@radix-ui/react-popover';

const colorOptions = [
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Green', value: 'bg-green-500' },
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Yellow', value: 'bg-yellow-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Cyan', value: 'bg-cyan-500' },
  { name: 'Indigo', value: 'bg-indigo-500' },
  { name: 'Teal', value: 'bg-teal-500' },
];

interface AIChatWidgetProps {
  widgetId: string;
}

export function AIChatWidget({ widgetId }: AIChatWidgetProps) {
  const conversations = useChatStore((state) => state.conversations);
  const createConversation = useChatStore((state) => state.createConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const getConversation = useChatStore((state) => state.getConversation);
  const addMessage = useChatStore((state) => state.addMessage);
  const clearMessages = useChatStore((state) => state.clearMessages);

  const activeConversationId = useUIStore((state) => state.activeConversationId);
  const setActiveConversationIdId = useUIStore((state) => state.setActiveConversationIdId);

  // Use React Query for server state
  const { data: models = [], isLoading: modelsLoading } = useOllamaModels();
  const { data: isOllamaRunning = false, isLoading: statusLoading } = useOllamaStatus();

  const [selectedModel, setSelectedModel] = useState<string>('llama3.2');
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation = activeConversationId
    ? getConversation(activeConversationId)
    : null;

  // Set first model as selected if available (React Query handles fetching)
  useEffect(() => {
    if (models.length > 0 && !selectedModel) {
      setSelectedModel(models[0].name);
    }
  }, [models, selectedModel]);

  // Create initial conversation if none exist
  useEffect(() => {
    if (conversations.length === 0 && isOllamaRunning) {
      const id = createConversation(selectedModel);
      setActiveConversationId(id);
    } else if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations.length, isOllamaRunning]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConversationId || isGenerating) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsGenerating(true);

    // Add user message
    addMessage(activeConversationId, {
      role: 'user',
      content: userMessage,
    });

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const conversation = getConversation(activeConversationId);
      if (!conversation) return;

      // Prepare messages for Ollama
      const messages = conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Add the new user message
      messages.push({ role: 'user', content: userMessage });

      // Create placeholder for streaming response
      const assistantMessageId = `message-${Date.now()}-${Math.random()}`;
      let streamedContent = '';

      addMessage(activeConversationId, {
        role: 'assistant',
        content: '',
      });

      const startTime = Date.now();

      // Generate response with streaming
      await generateChatResponse(
        {
          model: selectedModel,
          messages,
          stream: true,
        },
        (chunk) => {
          streamedContent += chunk;

          // Update the last message (assistant's response)
          const conv = getConversation(activeConversationId);
          if (conv && conv.messages.length > 0) {
            const lastMessage = conv.messages[conv.messages.length - 1];
            if (lastMessage.role === 'assistant') {
              updateConversation(activeConversationId, {
                messages: [
                  ...conv.messages.slice(0, -1),
                  { ...lastMessage, content: streamedContent },
                ],
              });
            }
          }
        }
      );

      const responseTime = Date.now() - startTime;

      // Update final message with metadata
      const conv = getConversation(activeConversationId);
      if (conv && conv.messages.length > 0) {
        const lastMessage = conv.messages[conv.messages.length - 1];
        if (lastMessage.role === 'assistant') {
          updateConversation(activeConversationId, {
            messages: [
              ...conv.messages.slice(0, -1),
              { ...lastMessage, responseTime, model: selectedModel },
            ],
          });
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);

      // Add error message
      addMessage(activeConversationId, {
        role: 'assistant',
        content: '❌ Error: Failed to generate response. Make sure Ollama is running.',
      });
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    const id = createConversation(selectedModel);
    setActiveConversationId(id);
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteConversation(id);
    }
  };

  const handleStartEdit = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateConversation(id, { title: editTitle.trim() });
    }
    setEditingId(null);
  };

  const handleColorChange = (id: string, color: string) => {
    updateConversation(id, { color });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleExportChat = () => {
    if (!activeConversation) return;

    const markdown = activeConversation.messages
      .map((msg) => {
        const role = msg.role === 'user' ? '**You**' : '**AI**';
        return `${role}:\n${msg.content}\n`;
      })
      .join('\n---\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOllamaRunning) {
    return (
      <div className="h-full flex items-center justify-center bg-background p-8">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Bot className="h-16 w-16 mx-auto text-muted-foreground" />
            <h3 className="text-xl font-bold">Ollama Not Running</h3>
            <p className="text-sm text-muted-foreground">
              Start Ollama to use AI chat features. Make sure you have at least one model
              installed.
            </p>
            <div className="space-y-2 text-xs text-left bg-muted p-4 rounded-md">
              <p className="font-mono">$ ollama serve</p>
              <p className="font-mono">$ ollama pull llama3.2</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* Conversations Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-card" aria-label="Conversations">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="font-semibold">AI Chat</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              aria-label="New conversation"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Model Selector */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                aria-label="Select AI model"
              >
                <span className="truncate">{selectedModel}</span>
                <ChevronDown className="h-3 w-3 ml-2" aria-hidden="true" />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[240px] bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-1 z-50"
                sideOffset={5}
                aria-label="Available models"
              >
                {models.map((model) => (
                  <DropdownMenu.Item
                    key={model.name}
                    className="flex flex-col items-start gap-1 px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded outline-none"
                    onSelect={() => setSelectedModel(model.name)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">{model.name}</span>
                      {selectedModel === model.name && (
                        <CheckIcon className="h-3 w-3 text-primary" aria-hidden="true" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatModelSize(model.size)}
                    </span>
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1" role="list" aria-label="Conversations">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground" role="status">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => {
              const isEditing = editingId === conv.id;
              const isActive = activeConversationId === conv.id;

              return (
                <div
                  key={conv.id}
                  role="listitem"
                  className={cn(
                    'group relative p-3 rounded-md cursor-pointer transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                  onClick={() => !isEditing && setActiveConversationId(conv.id)}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {/* Color indicator */}
                  {conv.color && (
                    <div className={cn('w-1 h-full absolute left-0 top-0 rounded-l-md', conv.color)} aria-hidden="true" />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(conv.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full font-medium text-sm bg-background text-foreground px-2 py-1 rounded border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                          aria-label="Edit conversation title"
                          autoFocus
                        />
                      ) : (
                        <>
                          <span className="font-medium text-sm truncate block">
                            {conv.title}
                          </span>
                          <p className="text-xs opacity-70 mt-1">
                            {conv.messages.length} messages
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isEditing ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'h-6 w-6',
                            isActive && 'hover:bg-primary-foreground/20'
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit(conv.id);
                          }}
                          aria-label="Save title"
                        >
                          <Check className="h-3 w-3" aria-hidden="true" />
                        </Button>
                      ) : (
                        <>
                          <Popover.Root>
                            <Popover.Trigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  'h-6 w-6',
                                  isActive && 'hover:bg-primary-foreground/20'
                                )}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Choose color for ${conv.title}`}
                              >
                                <div className={cn('h-3 w-3 rounded-full border-2', conv.color || 'border-current')} aria-hidden="true" />
                              </Button>
                            </Popover.Trigger>
                            <Popover.Portal>
                              <Popover.Content
                                className="bg-popover text-popover-foreground border border-border rounded-md shadow-lg p-3 z-50"
                                sideOffset={5}
                                onClick={(e) => e.stopPropagation()}
                                aria-label="Color picker"
                              >
                                <div className="space-y-2">
                                  <p className="text-xs font-semibold">Chat Color</p>
                                  <div className="grid grid-cols-5 gap-2" role="group" aria-label="Color options">
                                    {colorOptions.map((color) => (
                                      <button
                                        key={color.value}
                                        className={cn(
                                          'h-6 w-6 rounded-full transition-transform hover:scale-110',
                                          color.value,
                                          conv.color === color.value && 'ring-2 ring-offset-2 ring-primary'
                                        )}
                                        onClick={() => handleColorChange(conv.id, color.value)}
                                        aria-label={color.name}
                                        aria-pressed={conv.color === color.value}
                                      />
                                    ))}
                                  </div>
                                  <button
                                    className="w-full text-xs text-muted-foreground hover:text-foreground mt-2"
                                    onClick={() => handleColorChange(conv.id, '')}
                                    aria-label="Clear color"
                                  >
                                    Clear color
                                  </button>
                                </div>
                              </Popover.Content>
                            </Popover.Portal>
                          </Popover.Root>

                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-6 w-6',
                              isActive && 'hover:bg-primary-foreground/20'
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(conv.id, conv.title);
                            }}
                            aria-label={`Edit ${conv.title} title`}
                          >
                            <Edit2 className="h-3 w-3" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              'h-6 w-6',
                              isActive && 'hover:bg-primary-foreground/20'
                            )}
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            aria-label={`Delete ${conv.title}`}
                          >
                            <Trash2 className="h-3 w-3" aria-hidden="true" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col" role="region" aria-label="Chat messages">
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center space-y-4 max-w-md">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
              <h3 className="text-xl font-bold">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground">
                Click "New" to create a conversation and start chatting with AI
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{activeConversation.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Model: {activeConversation.model}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => clearMessages(activeConversation.id)}
                  aria-label="Clear messages"
                >
                  <RefreshCw className="h-3 w-3 mr-2" aria-hidden="true" />
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportChat}
                  aria-label="Export chat as markdown"
                >
                  <Download className="h-3 w-3 mr-2" aria-hidden="true" />
                  Export
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">
                    Send a message to start the conversation
                  </p>
                </div>
              ) : (
                activeConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                        </div>
                      </div>
                    )}

                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg p-4',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const codeString = String(children).replace(/\n$/, '');

                              return !inline && match ? (
                                <div className="relative group">
                                  <SyntaxHighlighter
                                    style={atomOneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                  >
                                    {codeString}
                                  </SyntaxHighlighter>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                                    onClick={() => handleCopyCode(codeString)}
                                    aria-label="Copy code"
                                  >
                                    {copiedCode === codeString ? (
                                      <CheckIcon className="h-3 w-3" aria-hidden="true" />
                                    ) : (
                                      <Copy className="h-3 w-3" aria-hidden="true" />
                                    )}
                                  </Button>
                                </div>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {message.responseTime && (
                        <p className="text-xs opacity-70 mt-2">
                          {Math.round(message.responseTime / 1000)}s
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Message input"
                />
                {isGenerating ? (
                  <Button
                    onClick={handleStopGeneration}
                    variant="destructive"
                    aria-label="Stop generating"
                  >
                    <StopCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                    Stop
                  </Button>
                ) : (
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4 mr-2" aria-hidden="true" />
                    Send
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
