
/** Ensure basic columns exist when reading older local/DB rows. */
const TIME_LANES = new Set(['morning', 'afternoon', 'evening', 'any'])

export function normalizeHabitBehaviorFields<H extends Record<string, unknown>>(h: H): H {
  const lane = h.time_lane as string | undefined
  const time_lane = lane && TIME_LANES.has(lane) ? lane : 'any'
  return {
    ...h,
    time_lane,
    context_tag: (h.context_tag as string | null | undefined)?.trim() || null,
  }
}
