#!/usr/bin/env node
import { Command } from 'commander'
import { addHabit, listHabits, findHabit, deleteHabit } from './habits.js'
import { markDone, getCompletionDates, getDoneSetForDate } from './tracking.js'
import { computeStats } from './stats.js'
import { ok, err, printHabitList, printStats } from './display.js'
import { AppError } from './errors.js'

/** Returns today's date as an ISO string YYYY-MM-DD (local system time) */
function today(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const program = new Command()

program
  .name('habit')
  .description('CLI habit tracker — track daily habits and streaks')
  .version('1.0.0')

// ── add ──────────────────────────────────────────────────────────────────────
program
  .command('add <name>')
  .description('Add a new habit to track')
  .action((name: string) => {
    try {
      addHabit(name)
      ok(`Added habit: "${name}"`)
    } catch (e) {
      handleError(e)
    }
  })

// ── list ─────────────────────────────────────────────────────────────────────
program
  .command('list')
  .description('List all habits with today\'s status and current streak')
  .action(() => {
    try {
      const habits = listHabits()
      const todayStr = today()
      const doneSet = getDoneSetForDate(todayStr)
      const streakMap = new Map<number, number>()
      for (const habit of habits) {
        const dates = getCompletionDates(habit.id)
        streakMap.set(habit.id, computeStats(dates, todayStr).currentStreak)
      }
      printHabitList(habits, doneSet, streakMap)
    } catch (e) {
      handleError(e)
    }
  })

// ── done ─────────────────────────────────────────────────────────────────────
program
  .command('done <name>')
  .description('Mark a habit as done for today')
  .action((name: string) => {
    try {
      const habit = findHabit(name)
      if (!habit) {
        err(`No habit named "${name}" found. Run \`habit list\` to see all habits.`)
        process.exit(1)
      }
      markDone(habit.id, today())
      ok(`Marked "${name}" as done today`)
    } catch (e) {
      handleError(e)
    }
  })

// ── stats ─────────────────────────────────────────────────────────────────────
program
  .command('stats')
  .description('Show streak and completion-rate statistics for all habits')
  .action(() => {
    try {
      const habits = listHabits()
      const todayStr = today()
      const statsMap = new Map(
        habits.map((habit) => {
          const dates = getCompletionDates(habit.id)
          return [habit.id, computeStats(dates, todayStr)]
        }),
      )
      printStats(habits, statsMap)
    } catch (e) {
      handleError(e)
    }
  })

// ── delete ────────────────────────────────────────────────────────────────────
program
  .command('delete <name>')
  .description('Delete a habit and all its history permanently')
  .action((name: string) => {
    try {
      deleteHabit(name)
      ok(`Deleted habit: "${name}"`)
    } catch (e) {
      handleError(e)
    }
  })

// ── error handler ─────────────────────────────────────────────────────────────
function handleError(e: unknown): never {
  if (e instanceof AppError) {
    err(e.message)
    process.exit(e.code === 'DB_ERROR' ? 2 : 1)
  }
  err(e instanceof Error ? e.message : 'An unexpected error occurred.')
  process.exit(2)
}

program.parse()
