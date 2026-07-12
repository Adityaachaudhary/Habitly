import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical, Pencil, Trash2, Check, Flame, Moon } from 'lucide-react'
import type { HabitWithStreak } from '../types'
import { CATEGORIES } from '../types'
import { cn } from '../utils/helpers'

interface HabitCardProps {
  habit: HabitWithStreak
  onToggle: (id: string) => Promise<void>
  onEdit: (habit: HabitWithStreak) => void
  onDelete: (id: string) => Promise<void>
}

const resolveColor = (c: string) => 
  (c === '#22c55e' || c === '#16a34a' || c === '#4ade80' || c === '#15803d' || c === '#86efac') 
    ? 'var(--primary-500)' 
    : c

export default function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  const displayColor = resolveColor(habit.color)
  const [toggling, setToggling] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])
  const streak = habit.streak?.current_streak || 0
  const longest = habit.streak?.longest_streak || 0
  const streakProgress = Math.min((streak / (habit.goal_days || 30)) * 100, 100)

  async function handleToggle() {
    if (toggling) return
    setToggling(true)
    await onToggle(habit.id)
    setToggling(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="card p-6 relative group overflow-hidden"
      style={{ borderLeft: `4px solid ${displayColor}`, background: 'var(--card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Check button */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={cn('w-12 h-12 border-2 rounded-xl flex-shrink-0 transition-all duration-300 active:scale-90 flex items-center justify-center z-10', habit.completed_today && 'checked')}
            style={habit.completed_today ? { background: displayColor, borderColor: displayColor } : { borderColor: 'var(--border)' }}
          >
            {habit.completed_today ? (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Check size={20} className="text-white" strokeWidth={3.5} />
              </motion.div>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: displayColor }} />
            )}
          </button>

          {/* Title + category */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              className={cn(
                'font-display font-bold text-lg leading-tight transition-all',
                habit.completed_today ? 'line-through opacity-40' : 'text-text'
              )}
            >
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] px-2 py-1 rounded-lg font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: displayColor }}>
                {(() => {
                  const cat = CATEGORIES.find(c => c.label === habit.category);
                  if (cat) return <cat.icon size={12} strokeWidth={3} />;
                  return null;
                })()}
                {habit.category}
              </span>
              {habit.context_tag?.trim() && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide opacity-50"
                  style={{ color: 'var(--text)' }}
                >
                  {habit.context_tag.trim()}
                </span>
              )}
            </div>
            </div>
          </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="opacity-60 transition-opacity p-1 rounded-lg"
            style={{ color: 'var(--muted)' }}
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-20 w-32 card shadow-hover py-1"
            >
              <button
                onClick={() => { onEdit(habit); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs"
                style={{ color: 'var(--text)' }}
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => { onDelete(habit.id); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest opacity-40">
          <span>Progress</span>
          <span>{streakProgress.toFixed(0)}%</span>
        </div>
        <div className="w-full rounded-full h-1 bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${streakProgress}%`, background: displayColor }}
          />
        </div>
      </div>


      {/* Streak + best */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {streak > 0 ? (
              <Flame size={20} className="text-orange-500" />
            ) : (
              <Moon size={20} className="text-slate-400" />
            )}
          </span>
          <p className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>
            {streak} <span className="opacity-40 font-normal">streak</span>
          </p>
        </div>
        {longest > 0 && (
          <div className="text-[10px] uppercase opacity-40 text-right font-medium">
            Best {longest}d
          </div>
        )}
      </div>

      {/* Completed shimmer overlay */}
      {habit.completed_today && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: `${displayColor}08` }}
        />
      )}
    </motion.div>
  )
}
