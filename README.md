# Habit Tracker App

A full-stack habit tracking application with trading performance analytics, emotional check-ins, and goal setting.

## Features

- **Habit Tracking**: Create and monitor daily habits with streak tracking
- **Trading Journal**: Log trades with P&L analysis and emotional state tracking
- **Goal Setting**: Set and track progress toward personal and trading goals
- **Emotional Check-ins**: Daily mood tracking with analytics
- **Journal Entries**: Personal reflection and note-taking
- **Analytics Dashboard**: Comprehensive stats and progress visualization

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query
- **Forms**: React Hook Form with Zod validation

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   DATABASE_URL=your_postgresql_connection_string
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Deployment

This app is configured for deployment on Render with the included `render.yaml` configuration.

## Database Schema

The app uses the following main tables:
- `habits` - User habits with categories
- `habit_completions` - Daily completion tracking
- `trade_reviews` - Trading performance data
- `goal_tracking` - Personal and trading goals
- `emotional_check_ins` - Daily mood tracking
- `journal_entries` - Personal notes and reflections
- `risk_metrics` - Trading risk management data