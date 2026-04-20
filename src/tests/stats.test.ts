import { describe, it, expect } from 'vitest'
import { currentStreak, longestStreak, weeklyRate } from '../src/stats.js'

const TODAY = '2026-04-20'
const prev = (date: string, n = 1): string => {
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString().slice(0, 10)
}

// ── currentStreak ─────────────────────────────────────────────────────────────

describe('currentStreak', () => {
  it('returns 0 for empty dates', () => {
    expect(currentStreak([], TODAY)).toBe(0)
  })

  it('returns 1 when only today is done', () => {
    expect(currentStreak([TODAY], TODAY)).toBe(1)
  })

  it('returns 1 when only yesterday is done (today not done)', () => {
    const yesterday = prev(TODAY)
    expect(currentStreak([yesterday], TODAY)).toBe(1)
  })

  it('returns 0 when most recent date is two days ago', () => {
    const twoDaysAgo = prev(TODAY, 2)
    expect(currentStreak([twoDaysAgo], TODAY)).toBe(0)
  })

  it('counts consecutive days ending today', () => {
    const dates = [prev(TODAY, 2), prev(TODAY, 1), TODAY]
    expect(currentStreak(dates, TODAY)).toBe(3)
  })

  it('counts consecutive days ending yesterday when today not done', () => {
    const dates = [prev(TODAY, 3), prev(TODAY, 2), prev(TODAY, 1)]
    expect(currentStreak(dates, TODAY)).toBe(3)
  })

  it('breaks at a gap', () => {
    // 5 days ago, 4 days ago, then gap, then 2 days ago and 1 day ago
    const dates = [prev(TODAY, 5), prev(TODAY, 4), prev(TODAY, 2), prev(TODAY, 1)]
    // Most recent run ending yesterday = 2 days
    expect(currentStreak(dates, TODAY)).toBe(2)
  })

  it('handles a single long run', () => {
    const dates = Array.from({ length: 10 }, (_, i) => prev(TODAY, 9 - i))
    expect(currentStreak(dates, TODAY)).toBe(10)
  })
})

// ── longestStreak ─────────────────────────────────────────────────────────────

describe('longestStreak', () => {
  it('returns 0 for empty dates', () => {
    expect(longestStreak([])).toBe(0)
  })

  it('returns 1 for a single date', () => {
    expect(longestStreak([TODAY])).toBe(1)
  })

  it('returns length of a single unbroken run', () => {
    const dates = [prev(TODAY, 4), prev(TODAY, 3), prev(TODAY, 2), prev(TODAY, 1), TODAY]
    expect(longestStreak(dates)).toBe(5)
  })

  it('picks the longest run when there are multiple', () => {
    // run of 1, gap, run of 3, gap, run of 2
    const dates = [
      prev(TODAY, 10),
      prev(TODAY, 7), prev(TODAY, 6), prev(TODAY, 5),
      prev(TODAY, 2), prev(TODAY, 1),
    ]
    expect(longestStreak(dates)).toBe(3)
  })

  it('handles two equally long runs', () => {
    const dates = [
      prev(TODAY, 6), prev(TODAY, 5),
      prev(TODAY, 2), prev(TODAY, 1),
    ]
    expect(longestStreak(dates)).toBe(2)
  })
})

// ── weeklyRate ────────────────────────────────────────────────────────────────

describe('weeklyRate', () => {
  it('returns 0 for empty dates', () => {
    expect(weeklyRate([], TODAY)).toBe(0)
  })

  it('returns 100 when all 7 days done', () => {
    const dates = Array.from({ length: 7 }, (_, i) => prev(TODAY, 6 - i))
    expect(weeklyRate(dates, TODAY)).toBe(100)
  })

  it('returns 0 when no completions in last 7 days', () => {
    const dates = [prev(TODAY, 10), prev(TODAY, 8)]
    expect(weeklyRate(dates, TODAY)).toBe(0)
  })

  it('returns ~14 for 1 out of 7 days', () => {
    expect(weeklyRate([TODAY], TODAY)).toBe(14)
  })

  it('returns ~57 for 4 out of 7 days', () => {
    const dates = [
      prev(TODAY, 6), prev(TODAY, 4), prev(TODAY, 2), TODAY,
    ]
    expect(weeklyRate(dates, TODAY)).toBe(57)
  })

  it('ignores completions older than 7 days', () => {
    const dates = [prev(TODAY, 8), prev(TODAY, 7), TODAY]
    // Only TODAY is in the window (prev(TODAY, 7) is day 8 back from today — outside window)
    expect(weeklyRate(dates, TODAY)).toBe(14)
  })
})
