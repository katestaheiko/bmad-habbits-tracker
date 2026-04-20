import chalk from 'chalk'
import type { Habit } from './habits.js'
import type { HabitStats } from './stats.js'

/** Print a success message to stdout */
export function ok(msg: string): void {
  console.log(chalk.green('✓') + ' ' + msg)
}

/** Print an error message to stderr */
export function err(msg: string): void {
  console.error(chalk.red('✗') + ' ' + msg)
}

function padEnd(str: string, width: number): string {
  return str.length >= width ? str : str + ' '.repeat(width - str.length)
}

function padStart(str: string, width: number): string {
  return str.length >= width ? str : ' '.repeat(width - str.length) + str
}

/**
 * Print a table of habits with today's status and current streak.
 */
export function printHabitList(
  habits: Habit[],
  doneSet: Set<number>,
  streakMap: Map<number, number>,
): void {
  if (habits.length === 0) {
    console.log(chalk.dim('No habits yet. Run `habit add "name"` to get started.'))
    return
  }

  const nameWidth = Math.max(4, ...habits.map((h) => h.name.length))
  const header =
    padEnd('Name', nameWidth) + '  ' +
    padEnd('Today', 7) + '  ' +
    'Streak'
  const separator = '─'.repeat(header.length)

  console.log(chalk.bold(header))
  console.log(chalk.dim(separator))

  for (const habit of habits) {
    const done = doneSet.has(habit.id)
    const streak = streakMap.get(habit.id) ?? 0
    const statusIcon = done ? chalk.green('✓') : chalk.dim('–')
    const streakStr = streak > 0 ? chalk.yellow(`${streak}d`) : chalk.dim('0d')

    console.log(
      padEnd(habit.name, nameWidth) + '  ' +
      padEnd(statusIcon, 7 + 9) + '  ' + // +9 for chalk escape codes
      streakStr,
    )
  }
}

/**
 * Print a stats table with streak and rate information.
 */
export function printStats(
  habits: Habit[],
  statsMap: Map<number, HabitStats>,
): void {
  if (habits.length === 0) {
    console.log(chalk.dim('No habits yet.'))
    return
  }

  const nameWidth = Math.max(4, ...habits.map((h) => h.name.length))
  const header =
    padEnd('Name', nameWidth) + '  ' +
    padStart('Streak', 6) + '  ' +
    padStart('Longest', 7) + '  ' +
    padStart('7-Day', 5)
  const separator = '─'.repeat(nameWidth + 2 + 6 + 2 + 7 + 2 + 5)

  console.log(chalk.bold(header))
  console.log(chalk.dim(separator))

  for (const habit of habits) {
    const s = statsMap.get(habit.id) ?? { currentStreak: 0, longestStreak: 0, weeklyRate: 0 }
    const streakStr = s.currentStreak > 0 ? chalk.yellow(`${s.currentStreak}d`) : chalk.dim('0d')
    const longestStr = s.longestStreak > 0 ? chalk.cyan(`${s.longestStreak}d`) : chalk.dim('0d')
    const rateStr = s.weeklyRate > 0 ? chalk.green(`${s.weeklyRate}%`) : chalk.dim('0%')

    console.log(
      padEnd(habit.name, nameWidth) + '  ' +
      padStart(streakStr, 6 + 9) + '  ' +   // +9 chalk escape
      padStart(longestStr, 7 + 9) + '  ' +
      padStart(rateStr, 5 + 9),
    )
  }
}
