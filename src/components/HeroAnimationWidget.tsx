import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Flame, BookOpen, Droplets, Zap } from 'lucide-react'

const HABITS = [
  { id: 1, name: 'Read 20 Pages', category: 'Mind', icon: BookOpen, color: '#8b5cf6', streak: 12 },
  { id: 2, name: 'Drink 2L Water', category: 'Health', icon: Droplets, color: '#3b82f6', streak: 45 },
  { id: 3, name: 'Deep Work (2h)', category: 'Focus', icon: Zap, color: '#f59e0b', streak: 8 },
]

export default function HeroAnimationWidget() {
  const [completedIds, setCompletedIds] = useState<number[]>([])

  // Cycle through checking off habits
  useEffect(() => {
    let currentId = 0
    const interval = setInterval(() => {
      setCompletedIds(prev => {
        if (prev.length === HABITS.length) return [] // reset
        const nextId = HABITS[currentId].id
        currentId = (currentId + 1) % HABITS.length
        return [...prev, nextId]
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-lg mx-auto aspect-square flex items-center justify-center">
      {/* Background glowing rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-primary-500/10 pointer-events-none"
        style={{ scale: 1.1 }}
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-primary-400/5 pointer-events-none"
        style={{ scale: 1.3 }}
      />

      <div className="absolute inset-0 bg-primary-500/10 blur-3xl rounded-full opacity-40 pointer-events-none" />

      {/* Mock App Interface */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full rounded-[2rem] border-2 shadow-2xl p-6 flex flex-col gap-4 bg-surface dark:bg-zinc-950 backdrop-blur-xl"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="w-24 h-6 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
            <Flame className="text-white w-5 h-5" />
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {HABITS.map((habit, i) => {
              const isCompleted = completedIds.includes(habit.id)
              
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl border-l-4 transition-colors relative overflow-hidden"
                  style={{ 
                    borderColor: habit.color,
                    background: isCompleted ? 'rgba(0,0,0,0.02)' : 'var(--card)' 
                  }}
                >
                  {isCompleted && (
                    <motion.div
                      layoutId={`shimmer-${habit.id}`}
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{ background: habit.color }}
                      initial={{ x: '-100%' }}
                      animate={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <motion.div 
                      layout
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2"
                      style={{ 
                        borderColor: isCompleted ? habit.color : 'var(--border)',
                        background: isCompleted ? habit.color : 'transparent'
                      }}
                    >
                      {isCompleted ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        >
                          <Check className="text-white w-6 h-6" strokeWidth={3} />
                        </motion.div>
                      ) : (
                        <div className="w-2 h-2 rounded-full opacity-30" style={{ background: habit.color }} />
                      )}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <motion.h4 
                        layout="position"
                        className={`font-bold truncate transition-colors ${isCompleted ? 'opacity-40 line-through' : ''}`}
                      >
                        {habit.name}
                      </motion.h4>
                      <motion.div layout="position" className="flex items-center gap-2 mt-1">
                        <habit.icon className="w-3 h-3 opacity-50" style={{ color: habit.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                          {habit.category}
                        </span>
                      </motion.div>
                    </div>

                    <div className="text-right">
                      <motion.div 
                        layout="position"
                        className="font-display font-black text-lg"
                        style={{ color: habit.color }}
                      >
                        {habit.streak + (isCompleted ? 1 : 0)}
                      </motion.div>
                      <motion.div layout="position" className="text-[10px] uppercase font-bold opacity-40">
                        Streak
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating decorative elements */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl rotate-12 flex items-center justify-center shadow-lg"
        style={{ background: 'var(--primary-500)' }}
      >
        <Flame className="text-white w-8 h-8" />
      </motion.div>
      <motion.div 
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-8 -left-8 w-20 h-20 bg-amber-400 rounded-[1.5rem] -rotate-6 flex items-center justify-center shadow-lg"
      >
        <Zap className="text-white w-10 h-10" />
      </motion.div>
    </div>
  )
}
