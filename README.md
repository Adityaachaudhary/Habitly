# Habitly — AI-Powered Habit Tracker

Full-stack habit tracking app with analytics, social features, and AI coaching.

## Stack
- React + TypeScript + Vite
- Tailwind CSS v3 (light/dark mode)
- Supabase (database + auth)
- Groq API (AI insights)
- Recharts (analytics)

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GROQ_API_KEY
   ```

3. **Set up Supabase** — run the SQL schema from the roadmap doc in your Supabase SQL editor

4. **Run dev server**
   ```bash
   npm run dev
   ```

## Pages
- `/` — Landing + Auth (sign up / sign in)
- `/dashboard` — Today's habits, streaks, progress ring
- `/analytics` — 30-day trends, heatmap, per-habit charts
- `/social` — Leaderboard + friends
- `/settings` — Profile, notifications, theme
- `/premium` — AI features + live Groq demo

## Features
- ✅ Email auth (Supabase)
- ✅ Create / edit / delete habits with color, category, frequency
- ✅ Daily check-in with animated toggle
- ✅ Streak tracking & recalculation
- ✅ 30-day completion trend (Recharts LineChart)
- ✅ GitHub-style activity heatmap
- ✅ Per-habit bar chart
- ✅ Category pie chart
- ✅ Global leaderboard
- ✅ Friends system
- ✅ AI insights via Groq (live demo on Premium page)
- ✅ Dark / light mode with localStorage persistence
- ✅ Collapsible sidebar
- ✅ Skeleton loaders
- ✅ Responsive layout
