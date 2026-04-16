import { useState, useEffect } from 'react'
import {
  Zap, BarChart2, Users, Brain, ChevronDown, Moon, Sun, Mail, Globe
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { Link } from 'react-router-dom'
import AuthModal from '../components/common/AuthModal'
import { cn } from '../utils/helpers'

const FEATURES = [
  {
    icon: <Zap size={22} />,
    title: 'Atomic Tracking',
    desc: 'Log habits in seconds. Beautiful streaks keep you motivated every single day.',
    color: '#22c55e',
    comingSoon: false
  },
  {
    icon: <Brain size={22} />,
    title: 'AI Habit Coach',
    desc: 'Get personalized insights and streak recovery tips powered by Llama 3.3.',
    color: '#8b5cf6',
    comingSoon: true
  },
  {
    icon: <BarChart2 size={22} />,
    title: 'Advanced Analytics',
    desc: 'Visualize your progress with heatmaps, trend lines, and category breakdowns.',
    color: '#3b82f6',
    comingSoon: false
  },
  {
    icon: <Users size={22} />,
    title: 'Social Momentum',
    desc: 'Compete on global leaderboards and build habits together with friends.',
    color: '#f97316',
    comingSoon: true
  }
]

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    text: "Habitly's AI insights helped me realize why I was failing my morning routines. 30-day streak now!",
    avatar: 'S'
  },
  {
    name: 'Marcus Bell',
    role: 'Fitness Coach',
    text: "The cleanest UI I've seen in a habit tracker. My clients love the social leaderboard feature.",
    avatar: 'M'
  },
  {
    name: 'Elena Rossi',
    role: 'Student',
    text: "I used to forget everything. Now the daily reports keep me on track with my studies.",
    avatar: 'E'
  }
]

const FAQS = [
  { q: "Is Habitly free to use?", a: "Yes! Core habit tracking, basic analytics, and social features are completely free forever." },
  { q: "How does the AI Coach work?", a: "It analyzes your historical completion data to provide supportive, practical advice tailored to your life." },
  { q: "Can I use it on my phone?", a: "Habitly's responsive design works perfectly on mobile browsers, making it easy to log on the go." },
  { q: "Is my data secure?", a: "Absolutely. We use industry-standard encryption and Supabase for secure data management." }
]

export default function HomePage() {
  const { theme, toggleTheme } = useTheme()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  return (
    <div className="min-h-screen font-body" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Navbar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-[60] transition-all duration-300 px-6 py-4 flex items-center justify-between",
          scrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b" : "bg-transparent"
        )}
        style={{ borderColor: scrolled ? 'var(--border)' : 'transparent' }}
      >
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight hidden sm:block">Habitly</span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-sm">
          {['Features', 'Testimonials', 'FAQ'].map(item => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="opacity-70 transition-all"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all"
            style={{ color: 'var(--muted)' }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => openAuth('login')}
            className="hidden sm:block font-semibold text-sm px-4 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => openAuth('signup')}
            className="btn-primary px-5 py-2.5 text-sm shadow-lg shadow-primary-500/20 active:scale-95"
          >
            Join Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-400/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          {/* Text content */}
          <div className="flex-1 text-center lg:text-left space-y-8 animate-slide-up">

            <h1 className="font-display font-black text-5xl md:text-7xl tracking-tight leading-[1.05]">
              Master your <br />
              <span className="text-primary-600">daily rhythms.</span>
            </h1>
            <p className="text-lg md:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed opacity-80" style={{ color: 'var(--muted)' }}>
              Habitly combines atomic tracking with AI-powered coaching to help you build rituals that actually stick. Join a community of intentional high-performers.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                onClick={() => openAuth('signup')}
                className="btn-primary px-8 py-4 text-lg shadow-xl shadow-primary-500/30 w-full sm:w-auto transition-all"
              >
                Get Started for Free
              </button>
              <button className="px-8 py-4 rounded-2xl border font-bold text-lg transition-all w-full sm:w-auto" style={{ borderColor: 'var(--border)' }}>
                Watch Demo
              </button>
            </div>
            <div className="flex items-center gap-4 justify-center lg:justify-start text-sm opacity-60">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 bg-gray-200" style={{ borderColor: 'var(--bg)' }} />
                ))}
              </div>
              <p>Trusted by <span className="font-bold">10,000+</span> users worldwide</p>
            </div>
          </div>

          {/* Hero Image */}
          <div className="flex-1 w-full max-w-2xl animate-fade-in relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-violet-500 rounded-3xl blur opacity-20" />
            <img
              src="/landing_hero.png"
              alt="Habitly Dashboard"
              className="relative rounded-3xl shadow-2xl border w-full object-cover"
              style={{ borderColor: 'var(--border)' }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="font-display font-black text-4xl">Everything you need to grow.</h2>
            <p className="opacity-70" style={{ color: 'var(--muted)' }}>We've reimagined habit tracking with a focus on psychology and state-of-the-art technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon, title, desc, color, comingSoon }) => (
              <div
                key={title}
                className="card p-8 transition-all duration-300 relative"
                style={{ borderColor: 'var(--border)' }}
              >
                {comingSoon && (
                  <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: color + '20', color }}>
                    Coming Soon
                  </span>
                )}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ background: color + '15', color }}
                >
                  {icon}
                </div>
                <h3 className="font-bold text-xl mb-3">{title}</h3>
                <p className="text-sm leading-relaxed opacity-70" style={{ color: 'var(--muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6" style={{ background: 'rgba(0,0,0,0.02)' }}>
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="font-display font-black text-4xl">Built for momentum.</h2>
            <p className="opacity-70" style={{ color: 'var(--muted)' }}>Hear from our global community of habit masters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ name, role, text, avatar }) => (
              <div key={name} className="glass-card p-8 space-y-6 flex flex-col justify-between">
                <p className="text-lg italic opacity-90 leading-relaxed">"{text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black text-lg">
                    {avatar}
                  </div>
                  <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-xs opacity-60 uppercase font-black tracking-widest">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
          <h2 className="font-display font-black text-4xl text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {FAQS.map(({ q, a }, i) => (
              <details key={i} className="group card p-6 border transition-all cursor-pointer open:bg-primary-50/10" style={{ borderColor: 'var(--border)' }}>
                <summary className="font-bold list-none flex items-center justify-between">
                  {q}
                  <ChevronDown size={18} className="transition-transform group-open:rotate-180 opacity-60" />
                </summary>
                <p className="mt-4 text-sm leading-relaxed opacity-70" style={{ color: 'var(--muted)' }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary-500 flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-xl shadow-primary-500/30">
            👋
          </div>
          <h2 className="font-display font-black text-4xl">Have a question?</h2>
          <p className="text-lg opacity-70" style={{ color: 'var(--muted)' }}>
            We're here to help you on your journey. Text our team or join our community.
          </p>
          <div className="flex justify-center gap-4">
            <a href="mailto:hello@habitly.app" className="btn-primary px-8 py-3 flex items-center gap-2">
              <Mail size={18} /> Email Support
            </a>
            <button className="px-8 py-3 rounded-2xl border font-bold transition-all" style={{ borderColor: 'var(--border)' }}>
              Join Discord
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-sm opacity-60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">Habitly</span>
          </div>

          <div className="flex gap-8 font-medium">
            <Link to="/privacy" className="transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors">Terms of Service</Link>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="p-2 transition-all"><Mail size={18} /></a>
            <a href="#" className="p-2 transition-all"><Globe size={18} /></a>
          </div>
        </div>
        <p className="text-center text-xs opacity-40 mt-8">© 2026 Habitly. All rights reserved.</p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
      />
    </div>
  )
}
