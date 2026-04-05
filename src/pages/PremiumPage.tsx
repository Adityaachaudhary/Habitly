import { Zap, Brain, BarChart2, Target, MessageSquare, FileText, Check, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PREMIUM_FEATURES = [
  { icon: <Brain size={20} />, title: 'AI Habit Insights', desc: 'Smart pattern analysis tells you when and why you succeed', color: '#8b5cf6' },
  { icon: <FileText size={20} />, title: 'Weekly AI Reports', desc: 'Personalized Sunday summaries with actionable tips', color: '#3b82f6' },
  { icon: <BarChart2 size={20} />, title: 'Advanced Analytics', desc: 'Predictions, correlations, and optimization suggestions', color: '#22c55e' },
  { icon: <Target size={20} />, title: 'Habit Suggestions', desc: 'AI recommends habits based on your patterns', color: '#f97316' },
  { icon: <MessageSquare size={20} />, title: 'AI Coach', desc: 'Streak recovery help and personalized motivation', color: '#ec4899' },
  { icon: <Zap size={20} />, title: 'No Ads Ever', desc: 'Clean, distraction-free experience', color: '#f59e0b' },
]

export default function PremiumPage() {
  const { user } = useAuth()
  const canAccessAI = user?.is_premium || user?.id === 'guest-user-123'

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-fade-in" style={{ background: 'var(--bg)' }}>

      {/* Hero banner */}
      <div
        className="card p-10 text-center relative overflow-hidden shadow-xl border-none"
        style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 50%, #f5f3ff 100%)' }}
      >
        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 shadow-sm"
            style={{ background: '#fffbeb', color: '#d97706' }}
          >
            <Zap size={14} className="fill-current" /> ULTIMATE PERFORMANCE
          </div>
          <h1 className="font-display font-black text-4xl mb-4 tracking-tight" style={{ color: '#1a1a18' }}>
            Unlock Your Full Potential
          </h1>
          <p className="text-base mb-8 max-w-lg mx-auto leading-relaxed" style={{ color: '#4b5563' }}>
            Experience the next generation of habit tracking with AI-powered coaching, precision analytics, and personalized growth reports.
          </p>
          
          {user?.is_premium ? (
            <div className="flex flex-col items-center gap-4">
              <div
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-base shadow-lg"
                style={{ background: '#22c55e', color: 'white' }}
              >
                <Check size={20} strokeWidth={3} /> You're on Premium ✨
              </div>
              <Link 
                to="/ai-coach" 
                className="flex items-center gap-2 text-sm font-semibold hover:underline"
                style={{ color: '#8b5cf6' }}
              >
                Go to AI Coach <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="flex justify-center gap-4 flex-wrap">
              <button className="btn-primary text-lg px-8 py-4 shadow-lg hover:translate-y-[-2px] transition-all">
                <Zap size={20} className="fill-current" /> Upgrade Now
              </button>
              <button className="bg-white/80 backdrop-blur px-6 py-4 rounded-2xl text-sm font-bold border border-gray-200 hover:bg-white transition-all shadow-sm">
                View detailed pricing
              </button>
            </div>
          )}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-30 pointer-events-none blur-3xl shadow-amber-200"
          style={{ background: 'radial-gradient(circle, #22c55e, transparent)' }} />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-30 pointer-events-none blur-3xl shadow-violet-200"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      {/* Feature grid */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>
            Premium Features
          </h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Everything you need to build unbreakable habits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREMIUM_FEATURES.map(({ icon, title, desc, color }) => (
            <div 
              key={title} 
              className="card p-6 flex flex-col gap-4 border shadow-sm hover:shadow-md transition-all group"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: color + '15', color }}
              >
                {icon}
              </div>
              <div>
                <p className="font-bold text-lg mb-1" style={{ color: 'var(--text)' }}>{title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive AI Preview (for non-premium) */}
      {!canAccessAI && (
        <div className="card p-8 border-dashed border-2 relative overflow-hidden group" style={{ background: 'rgba(139, 92, 246, 0.02)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-3xl animate-bounce shadow-inner">
              🤖
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--text)' }}>Ready to talk to your Coach?</h3>
              <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                Our AI coach analyzed over 2 million habit patterns to help you stay consistent. Upgrade to start your conversation.
              </p>
              <button className="text-sm font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1 mx-auto md:mx-0">
                Learn more about AI coaching <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing */}
      <div className="space-y-6">
         <h2 className="font-display font-bold text-2xl text-center" style={{ color: 'var(--text)' }}>
            Choose Your Growth
          </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { plan: 'Monthly Growth', price: '$4.99', period: '/mo', badge: null, desc: 'Flexible access to all features' },
            { plan: 'Yearly Mastery', price: '$39.99', period: '/yr', badge: 'SAVE 33%', desc: 'Long-term commitment to excellence' },
          ].map(({ plan, price, period, badge, desc }) => (
            <div
              key={plan}
              className="card p-8 flex flex-col items-center text-center relative border-2 hover:scale-[1.02] transition-all"
              style={{ background: 'var(--card)', borderColor: badge ? '#22c55e' : 'var(--border)' }}
            >
              {badge && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] tracking-widest px-4 py-1.5 rounded-full font-black shadow-sm"
                  style={{ background: '#22c55e', color: 'white' }}
                >
                  {badge}
                </span>
              )}
              <p className="font-bold text-base mb-2" style={{ color: 'var(--text)' }}>{plan}</p>
              <p className="font-display font-black text-4xl mb-2" style={{ color: 'var(--text)' }}>
                {price}
                <span className="text-lg font-normal opacity-50" style={{ color: 'var(--muted)' }}>{period}</span>
              </p>
              <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>{desc}</p>
              
              <ul className="text-left w-full space-y-3 mb-8">
                {['All AI Features', 'Advanced Analytics', 'Unlimited Habits', 'No Advertisements'].map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text)' }}>
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Check size={12} className="text-green-500" />
                    </div>
                    {feat}
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${badge ? 'bg-green-500 text-white shadow-lg hover:bg-green-600' : 'bg-transparent border border-gray-200 hover:bg-gray-50'}`}
                style={!badge ? { color: 'var(--text)', borderColor: 'var(--border)' } : {}}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}