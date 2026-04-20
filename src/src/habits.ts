import db from './db.js'
import { AppError } from './errors.js'

export interface Habit {
  id: number
  name: string
  created_at: string
}

const MAX_NAME_LENGTH = 100

function validateName(name: string): void {
  if (name.trim().length === 0) {
    throw new AppError('INVALID_NAME', 'Habit name cannot be empty.')
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new AppError(
      'INVALID_NAME',
      `Habit name is too long (max ${MAX_NAME_LENGTH} characters).`,
    )
  }
}

export function addHabit(name: string): Habit {
  validateName(name)

  try {
    const stmt = db.prepare<[string], Habit>(
      'INSERT INTO habits (name) VALUES (?) RETURNING id, name, created_at',
    )
    const habit = stmt.get(name)
    if (!habit) throw new AppError('DB_ERROR', 'Failed to insert habit.')
    return habit
  } catch (e) {
    if (e instanceof AppError) throw e
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('UNIQUE constraint failed')) {
      throw new AppError('DUPLICATE', `A habit named "${name}" already exists.`)
    }
    throw new AppError('DB_ERROR', `Database error: ${msg}`)
  }
}

export function listHabits(): Habit[] {
  return db
    .prepare<[], Habit>('SELECT id, name, created_at FROM habits ORDER BY created_at ASC, id ASC')
    .all()
}

export function findHabit(name: string): Habit | undefined {
  return db
    .prepare<[string], Habit>('SELECT id, name, created_at FROM habits WHERE name = ?')
    .get(name)
}

export function deleteHabit(name: string): void {
  const habit = findHabit(name)
  if (!habit) {
    throw new AppError('NOT_FOUND', `No habit named "${name}" found.`)
  }
  // Tracking rows are removed via ON DELETE CASCADE
  db.prepare('DELETE FROM habits WHERE id = ?').run(habit.id)
}
