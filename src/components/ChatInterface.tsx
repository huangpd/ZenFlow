'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { chat, clearChatHistory } from '@/actions/ai';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatInterface({ initialMessages = [] }: { initialMessages?: Message[] }) {
  const cleanContent = (content: string) => {
    return content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  };

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await chat(userMessage);
      if (result.success && result.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.response! }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (confirm('确定要清除所有对话记录吗？')) {
      try {
        await clearChatHistory();
        setMessages([]);
      } catch (error) {
        console.error('清除对话失败:', error);
        alert('清除对话失败，请重试');
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto animate-in fade-in duration-700">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-12">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center">
               <Bot className="w-8 h-8 text-stone-300" />
            </div>
            <p className="font-serif italic tracking-widest text-lg">万虑俱寂，一心参究...</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'flex flex-col space-y-4',
              m.role === 'user' ? 'items-end' : 'items-start'
            )}
          >
            {m.role === 'assistant' && (
              <div className="flex items-center space-x-2 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600/40" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium">AI 灵性伴侣</span>
              </div>
            )}
            <div
              className={cn(
                'max-w-[90%] md:max-w-[80%] px-4 py-3 transition-all duration-500 rounded-2xl',
                m.role === 'user'
                  ? 'text-right bg-stone-100'
                  : 'text-left bg-stone-50'
              )}
            >
              {m.role === 'assistant' ? (
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      h1: ({...props}) => <h1 className="text-lg font-serif tracking-wide text-stone-800 mt-4 mb-2" {...props} />,                      h2: ({...props}) => <h2 className="text-base font-serif tracking-wide text-stone-800 mt-3 mb-1.5" {...props} />,                      h3: ({...props}) => <h3 className="text-sm font-serif tracking-wide text-stone-800 mt-2 mb-1" {...props} />,                      p: ({...props}) => <p className="text-stone-700 leading-relaxed mb-2" {...props} />,                      ul: ({...props}) => <ul className="list-disc list-inside text-stone-700 mb-2 space-y-1" {...props} />,                      ol: ({...props}) => <ol className="list-decimal list-inside text-stone-700 mb-2 space-y-1" {...props} />,                      li: ({...props}) => <li className="text-stone-700" {...props} />,                      strong: ({...props}) => <strong className="font-semibold text-stone-800" {...props} />,                      em: ({...props}) => <em className="italic text-stone-700" {...props} />,                      code: ({inline, ...props}: any) => 
                        inline ? (
                          <code className="bg-stone-100 text-emerald-700 px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                        ) : (
                          <code className="bg-stone-100 text-emerald-700 p-2 rounded block text-sm font-mono mb-2 overflow-x-auto" {...props} />
                        ),
                      blockquote: ({...props}) => <blockquote className="border-l-4 border-emerald-400 pl-4 italic text-stone-600 my-2" {...props} />,                      a: ({...props}) => <a className="text-emerald-600 hover:underline" {...props} />,                    }}
                  >
                    {cleanContent(m.content)}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className={cn(
                  "text-lg leading-relaxed tracking-wide",
                  m.role === 'user' 
                    ? "text-stone-600 font-sans" 
                    : "text-stone-800 font-serif"
                )}>
                  {cleanContent(m.content)}
                </div>
              )}
            </div>
            {m.role === 'user' && (
               <div className="w-8 h-[1px] bg-stone-100 mr-2" />
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start space-y-4">
             <div className="flex items-center space-x-2 px-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600/40 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-medium italic">妙语酝酿中...</span>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 space-y-3">
        <div className="flex justify-end">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-stone-400 hover:text-stone-600 transition-colors tracking-widest"
            >
              清除对话
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="以此静心，开启对话..."
            className="w-full px-6 py-4 bg-stone-50 border-none rounded-2xl focus:outline-none focus:ring-1 focus:ring-stone-200 text-stone-700 placeholder:text-stone-300 transition-all font-serif italic"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-stone-400 hover:text-stone-800 disabled:opacity-0 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center mt-4 text-[10px] text-stone-300 tracking-[0.3em] uppercase">静心 • 参悟 • 成长</p>
      </div>
    </div>
  );
}
