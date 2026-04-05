import { useEffect, useState } from 'react'
import { BookOpenCheck, Save } from 'lucide-react'
import { useWeekReview } from '../context/WeekReviewContext'
import { formatWeekRangeLabel, getWeekMondayIso, listRecentWeekMondays } from '../utils/weekReviewHelpers'

const WEEK_OPTIONS = 16
const MAX_LEN = 600

export default function WeekReviewPanel() {
  const { reviews, loading, saveReview, getReviewForWeek } = useWeekReview()
  const [selectedWeek, setSelectedWeek] = useState(() => getWeekMondayIso())
  const [whatWorked, setWhatWorked] = useState('')
  const [whatBroke, setWhatBroke] = useState('')
  const [changeNext, setChangeNext] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [justSaved, setJustSaved] = useState(false)

  const weekChoices = listRecentWeekMondays(WEEK_OPTIONS)

  useEffect(() => {
    const existing = getReviewForWeek(selectedWeek)
    setWhatWorked(existing?.what_worked ?? '')
    setWhatBroke(existing?.what_broke ?? '')
    setChangeNext(existing?.change_next_week ?? '')
    setError('')
    setJustSaved(false)
  }, [selectedWeek, reviews, getReviewForWeek])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await saveReview(selectedWeek, {
        what_worked: whatWorked,
        what_broke: whatBroke,
        change_next_week: changeNext,
      })
      setJustSaved(true)
      setTimeout(() => setJustSaved(false), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save review.')
    } finally {
      setSaving(false)
    }
  }

  const otherReviews = reviews.filter(r => r.week_start_date !== selectedWeek)

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="card p-6">
        <div className="flex items-start gap-3 mb-6">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139, 92, 246, 0.15)' }}
          >
            <BookOpenCheck className="text-violet-600 dark:text-violet-400" size={22} />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
              End-of-week review
            </h3>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
              Three short answers: what worked, what broke, and one concrete change for next week. Weeks run Monday–Sunday (your local calendar).
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Week
            </label>
            <select
              value={selectedWeek}
              onChange={e => setSelectedWeek(e.target.value)}
              className="input w-full sm:max-w-md"
              disabled={loading}
            >
              {weekChoices.map(iso => (
                <option key={iso} value={iso}>
                  {formatWeekRangeLabel(iso)}
                  {iso === getWeekMondayIso() ? ' (this week)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              What worked? *
            </label>
            <textarea
              value={whatWorked}
              onChange={e => setWhatWorked(e.target.value.slice(0, MAX_LEN))}
              className="input resize-none min-h-[88px]"
              placeholder="Routines, habits, or mindsets that helped — even small wins."
              required
            />
            <p className="text-[10px] mt-1 opacity-60 text-right" style={{ color: 'var(--muted)' }}>
              {whatWorked.length}/{MAX_LEN}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              What broke or felt hard? *
            </label>
            <textarea
              value={whatBroke}
              onChange={e => setWhatBroke(e.target.value.slice(0, MAX_LEN))}
              className="input resize-none min-h-[88px]"
              placeholder="Missed days, friction, energy, schedule — no judgment, just clarity."
              required
            />
            <p className="text-[10px] mt-1 opacity-60 text-right" style={{ color: 'var(--muted)' }}>
              {whatBroke.length}/{MAX_LEN}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              One change for next week *
            </label>
            <textarea
              value={changeNext}
              onChange={e => setChangeNext(e.target.value.slice(0, MAX_LEN))}
              className="input resize-none min-h-[88px]"
              placeholder="A single experiment: earlier bedtime, smaller habit, one less commitment…"
              required
            />
            <p className="text-[10px] mt-1 opacity-60 text-right" style={{ color: 'var(--muted)' }}>
              {changeNext.length}/{MAX_LEN}
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button type="submit" disabled={saving || loading} className="btn-primary inline-flex items-center gap-2">
              <Save size={18} />
              {saving ? 'Saving…' : getReviewForWeek(selectedWeek) ? 'Update review' : 'Save review'}
            </button>
            {justSaved && (
              <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Saved.</span>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-3 uppercase tracking-widest opacity-60" style={{ color: 'var(--muted)' }}>
          Past reviews (trends)
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="card p-5">
                <div className="skeleton h-4 w-1/3 mb-4" />
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-full" />
              </div>
            ))}
          </div>
        ) : otherReviews.length === 0 ? (
          <div className="card p-8 text-center">
            <p style={{ color: 'var(--muted)' }}>
              No other weeks saved yet. Your reviews will show up here as a timeline.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {otherReviews.map(r => (
              <li key={r.id} className="card p-5 border-l-4 border-l-violet-500/70">
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
                  {formatWeekRangeLabel(r.week_start_date)}
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-primary-600 dark:text-primary-400">
                      Worked
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                      {r.what_worked}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-amber-600 dark:text-amber-400">
                      Broke / hard
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                      {r.what_broke}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-violet-600 dark:text-violet-400">
                      Next week
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                      {r.change_next_week}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
