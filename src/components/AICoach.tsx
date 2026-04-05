import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Trash2, Sparkles, MessageSquare } from 'lucide-react'
import type { ChatMessage } from '../hooks/useAIInsights'
import { cn } from '../utils/helpers'

const SUGGESTED_PROMPTS = [
  'Why am I struggling with consistency?',
  'How can I build a better morning routine?',
  'Which habit should I focus on first?',
  'I broke my streak. Help me restart.',
  'Give me a weekly challenge.',
]

interface AICoachProps {
  chatHistory: ChatMessage[]
  chatLoading: boolean
  onSend: (message: string) => Promise<void>
  onClear: () => void
}

export default function AICoach({ chatHistory, chatLoading, onSend, onClear }: AICoachProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, chatLoading])

  async function handleSend() {
    const msg = input.trim()
    if (!msg || chatLoading) return
    setInput('')
    await onSend(msg)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col" style={{ minHeight: 520 }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
          >
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Habit Coach</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Powered by Groq · Llama 3.3</p>
            </div>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <button onClick={onClear} className="btn-ghost p-2 text-xs flex items-center gap-1.5" style={{ color: 'var(--muted)' }}>
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ minHeight: 340 }}>
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8 animate-fade-in">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)' }}
            >
              <MessageSquare size={28} style={{ color: '#8b5cf6' }} />
            </div>
            <h4 className="font-display font-bold text-base mb-1" style={{ color: 'var(--text)' }}>
              Your AI Habit Coach
            </h4>
            <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
              Ask me anything about your habits — I'll give personalized advice based on your data.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center max-w-sm">
              {SUGGESTED_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  className="text-xs px-3 py-2 rounded-xl border transition-all hover:shadow-sm active:scale-95"
                  style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)', color: '#8b5cf6' }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg, i) => (
          <div key={i} className={cn('flex gap-3 animate-slide-up', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: msg.role === 'assistant' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'var(--border)' }}
            >
              {msg.role === 'assistant'
                ? <Bot size={14} className="text-white" />
                : <User size={14} style={{ color: 'var(--muted)' }} />
              }
            </div>
            <div
              className={cn('max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed', msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm')}
              style={{
                background: msg.role === 'user' ? '#8b5cf6' : 'var(--bg)',
                color: msg.role === 'user' ? 'white' : 'var(--text)',
                border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              }}
            >
              {msg.content}
              <p className="text-xs mt-1.5 opacity-60" style={{ color: msg.role === 'user' ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
                {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {chatLoading && (
          <div className="flex gap-3 animate-fade-in">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}
            >
              <Bot size={14} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-2 h-2 rounded-full" style={{ background: '#8b5cf6', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        {chatHistory.length > 0 && chatHistory.length < 6 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {SUGGESTED_PROMPTS.slice(0, 3).map(prompt => (
              <button
                key={prompt}
                onClick={() => onSend(prompt)}
                className="text-xs px-3 py-1.5 rounded-xl flex-shrink-0 transition-all hover:opacity-80"
                style={{ background: 'rgba(139,92,246,0.08)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                <Sparkles size={10} className="inline mr-1" />
                {prompt}
              </button>
            ))}
          </div>
        )}
        <div
          className="flex items-end gap-3 p-3 rounded-2xl border transition-all focus-within:border-violet-400"
          style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your habit coach..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none"
            style={{ color: 'var(--text)', maxHeight: 120, lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatLoading}
            className={cn('w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all', input.trim() && !chatLoading ? 'active:scale-90' : 'opacity-40 cursor-not-allowed')}
            style={{ background: input.trim() && !chatLoading ? '#8b5cf6' : 'var(--border)' }}
          >
            <Send size={14} style={{ color: input.trim() && !chatLoading ? 'white' : 'var(--muted)' }} />
          </button>
        </div>
        <p className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
