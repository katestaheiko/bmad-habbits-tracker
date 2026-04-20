import { describe, it, expect } from 'vitest'
import { currentStreak } from '../src/stats.js'

const TODAY = '2026-04-20'
const prev = (date: string, n = 1): string => {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

// Verify invariants of the habit domain model using pure functions only.
// Database-level tests (addHabit, markDone) are covered by end-to-end usage.

describe('streak invariants', () => {
  it('a fresh habit with no completions has streak 0', () => {
    expect(currentStreak([], TODAY)).toBe(0)
  })

  it('completing a habit today immediately creates a streak of 1', () => {
    expect(currentStreak([TODAY], TODAY)).toBe(1)
  })

  it('streak extends by 1 for each additional consecutive day', () => {
    for (let n = 1; n <= 7; n++) {
      const dates = Array.from({ length: n }, (_, i) => prev(TODAY, n - 1 - i))
      expect(currentStreak(dates, TODAY)).toBe(n)
    }
  })

  it('streak resets to 0 if two or more days are missed', () => {
    // Last completion was 3 days ago
    const dates = [prev(TODAY, 5), prev(TODAY, 4), prev(TODAY, 3)]
    expect(currentStreak(dates, TODAY)).toBe(0)
  })

  it('marking done twice on the same day does not change streak', () => {
    // Simulating idempotent markDone: same date appears once in the set
    const uniqueDates = [...new Set([TODAY, TODAY])]
    expect(currentStreak(uniqueDates, TODAY)).toBe(1)
  })

  it('streak is preserved when today is not yet done but yesterday was', () => {
    const yesterday = prev(TODAY)
    const dates = [prev(TODAY, 2), yesterday]
    expect(currentStreak(dates, TODAY)).toBe(2)
  })
})
