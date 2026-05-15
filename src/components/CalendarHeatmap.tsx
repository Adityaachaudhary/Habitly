import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { Check } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '../utils/helpers'
import './CalendarHeatmap.css'

interface CalendarHeatmapProps {
  logs: { habit_id: string; log_date: string; completed: boolean }[]
  habitCount: number
}

export default function CalendarHeatmap({ logs, habitCount }: CalendarHeatmapProps) {
  const [date, setDate] = useState(new Date())

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null

    const dateStr = format(date, 'yyyy-MM-dd')
    const dayLogs = logs.filter(l => l.log_date === dateStr)
    const completedCount = dayLogs.filter(l => l.completed).length
    const rate = habitCount > 0 ? completedCount / habitCount : 0
    const isCompleted = rate >= 1 && habitCount > 0

    const radius = 10
    const circumference = 2 * Math.PI * radius

    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Progress Circle Overlay */}
        <svg viewBox="0 0 32 32" className="absolute inset-0 -rotate-90 w-full h-full p-1.5">
          <circle
            cx="16" cy="16" r={radius}
            fill="none" stroke="var(--border)"
            strokeWidth="3" className="opacity-10"
          />
          {rate > 0 && (
            <circle
              cx="16" cy="16" r={radius}
              fill="none" stroke="var(--primary-500)"
              strokeWidth="3" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - rate)}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          )}
        </svg>

        <div className="relative z-10 flex items-center justify-center">
          {isCompleted ? (
            <Check size={12} className="text-primary-600 dark:text-primary-400" strokeWidth={4} />
          ) : (
            <span className={cn(
              "text-[10px] font-bold",
              rate > 0 ? "opacity-100" : "opacity-40"
            )}>
              {date.getDate()}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="compact-calendar-wrapper">
      <Calendar
        onChange={(val) => setDate(val as Date)}
        value={date}
        tileContent={tileContent}
        calendarType="iso8601"
        className="habit-calendar"
        prev2Label={null}
        next2Label={null}
      />

      {/* Small Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border border-dashed opacity-30" style={{ borderColor: 'var(--muted)' }} />
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-40">Empty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-primary-500/40" />
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-40">Part</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex items-center justify-center">
            <Check size={6} className="text-white" strokeWidth={5} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-40">Done</span>
        </div>
      </div>
    </div>
  )
}
