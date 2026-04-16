import { Brain, RefreshCw, Sparkles, AlertCircle, Clock } from 'lucide-react'
import type { InsightState } from '../hooks/useAIInsights'
import { cn } from '../utils/helpers'

interface AIInsightPanelProps {
  insight: InsightState
  onGenerate: () => void
  isPremium?: boolean
}

export default function AIInsightPanel({ insight, onGenerate, isPremium = false }: AIInsightPanelProps) {
  const { text, generatedAt, loading, error } = insight

  const timeLabel = generatedAt
    ? generatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div
      className="card p-5 relative overflow-hidden"
      style={{ background: isPremium ? 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)' : 'var(--card)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#8b5cf620' }}>
            <Brain size={16} style={{ color: '#8b5cf6' }} />
          </div>
          <div>
            <h3 className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>
              AI Daily Insight
            </h3>
            {timeLabel && (
              <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--muted)' }}>
                <Clock size={10} /> Updated {timeLabel}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={loading}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all',
            loading ? 'opacity-60 cursor-not-allowed' : 'active:scale-95'
          )}
          style={{ background: '#8b5cf6', color: 'white' }}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Thinking...' : text ? 'Refresh' : 'Generate'}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          <div className="skeleton h-3.5 w-full rounded-lg" style={{ background: '#ddd6fe' }} />
          <div className="skeleton h-3.5 w-5/6 rounded-lg" style={{ background: '#ddd6fe' }} />
          <div className="skeleton h-3.5 w-4/6 rounded-lg" style={{ background: '#ddd6fe' }} />
        </div>
      )}

      {error && !loading && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl text-xs"
          style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
        >
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {text && !loading && !error && (
        <div className="animate-slide-up">
          <div
            className="flex gap-2.5 p-3.5 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
          >
            <Sparkles size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#8b5cf6' }} />
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{text}</p>
          </div>
        </div>
      )}

      {!text && !loading && !error && (
        <div
          className="flex flex-col items-center justify-center py-4 rounded-xl text-center"
          style={{ border: '1.5px dashed rgba(139,92,246,0.3)' }}
        >
          <Brain size={22} className="mb-2 opacity-30" style={{ color: '#8b5cf6' }} />
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Get a personalized insight based on your habits
          </p>
        </div>
      )}

      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
      />
    </div>
  )
}
