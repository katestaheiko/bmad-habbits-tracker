/**
 * Pure functions for streak and completion-rate calculations.
 * No database access — accepts pre-fetched sorted date arrays.
 * All dates are ISO 8601 strings: "YYYY-MM-DD"
 */

/** Subtract one day from an ISO date string */
function prevDay(date: string): string {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * Current streak: consecutive days ending on today or yesterday.
 * If today is done: count backward from today.
 * If today is NOT done but yesterday is: count backward from yesterday.
 * Otherwise: 0.
 */
export function currentStreak(dates: readonly string[], today: string): number {
  if (dates.length === 0) return 0

  const dateSet = new Set(dates)
  const yesterday = prevDay(today)

  // Determine starting point
  let cursor: string
  if (dateSet.has(today)) {
    cursor = today
  } else if (dateSet.has(yesterday)) {
    cursor = yesterday
  } else {
    return 0
  }

  let streak = 0
  while (dateSet.has(cursor)) {
    streak++
    cursor = prevDay(cursor)
  }
  return streak
}

/**
 * Longest streak: maximum run of consecutive calendar days.
 */
export function longestStreak(dates: readonly string[]): number {
  if (dates.length === 0) return 0

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = dates[i - 1]
    const curr = dates[i]
    if (prev === undefined || curr === undefined) continue

    const expected = new Date(prev + 'T00:00:00Z')
    expected.setUTCDate(expected.getUTCDate() + 1)
    const expectedStr = expected.toISOString().slice(0, 10)

    if (curr === expectedStr) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }

  return longest
}

/**
 * 7-day completion rate: percentage (0–100) of the last 7 days completed.
 * Includes today.
 */
export function weeklyRate(dates: readonly string[], today: string): number {
  if (dates.length === 0) return 0

  const dateSet = new Set(dates)
  let count = 0
  let cursor = today

  for (let i = 0; i < 7; i++) {
    if (dateSet.has(cursor)) count++
    cursor = prevDay(cursor)
  }

  return Math.round((count / 7) * 100)
}

export interface HabitStats {
  currentStreak: number
  longestStreak: number
  weeklyRate: number
}

export function computeStats(dates: readonly string[], today: string): HabitStats {
  return {
    currentStreak: currentStreak(dates, today),
    longestStreak: longestStreak(dates),
    weeklyRate: weeklyRate(dates, today),
  }
}
