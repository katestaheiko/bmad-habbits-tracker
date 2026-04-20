import db from './db.js'

export type MarkResult = 'created' | 'already_done'

/**
 * Records a habit completion for the given date.
 * Uses INSERT OR IGNORE so running twice on the same day is safe.
 */
export function markDone(habitId: number, date: string): MarkResult {
  const result = db
    .prepare('INSERT OR IGNORE INTO tracking (habit_id, date) VALUES (?, ?)')
    .run(habitId, date)
  return result.changes > 0 ? 'created' : 'already_done'
}

/**
 * Returns all completion dates for a habit, sorted ascending.
 */
export function getCompletionDates(habitId: number): string[] {
  const rows = db
    .prepare<[number], { date: string }>(
      'SELECT date FROM tracking WHERE habit_id = ? ORDER BY date ASC',
    )
    .all(habitId)
  return rows.map((r) => r.date)
}

/**
 * Returns all completion dates for the given date as a Set (O(1) lookup).
 * Used to build today's "done" status for the list command.
 */
export function getDoneSetForDate(date: string): Set<number> {
  const rows = db
    .prepare<[string], { habit_id: number }>(
      'SELECT habit_id FROM tracking WHERE date = ?',
    )
    .all(date)
  return new Set(rows.map((r) => r.habit_id))
}
