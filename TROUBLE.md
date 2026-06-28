# /trouble — World Cup bracket challenge

A password-gated, friends-only page at `johnludeke.com/trouble` with an
ESPN-style World Cup knockout bracket challenge.

## How it works

- The page is gated by one shared password (`TROUBLE_PASSWORD`).
- Each friend creates a username + their own password and names their bracket.
- They fill out the knockout bracket (Round of 32 → Champion), pick a
  total-goals tiebreaker, and submit. **Submitted brackets cannot be edited.**
- One global deadline (or a manual lock) closes submissions.
- Scoring is ESPN doubling: **R32=10, R16=20, QF=40, SF=80, Champion=160**
  (800 max). You earn a round's points for every team you correctly picked to
  win its match that round.
- Results are pulled automatically from football-data.org and scores recompute.
- Leaderboard + read-only view of anyone's bracket. Ties broken by closest
  predicted total goals in the final.

## Setup

### 1. Database

Run [`supabase-trouble-migration.sql`](./supabase-trouble-migration.sql) in the
Supabase SQL editor. It creates `wc_players`, `wc_matches`, and `wc_meta`
(RLS disabled, matching the existing `posts` table).

### 2. Environment variables

Add to `.env.local` (and to Vercel project settings for production):

```bash
TROUBLE_PASSWORD=the-shared-friends-password
FOOTBALL_DATA_API_KEY=your-football-data-org-key   # free at football-data.org
CRON_SECRET=any-long-random-string                 # protects the sync cron
```

Get a free API key at https://www.football-data.org/client/register (the
World Cup competition, code `WC`, is on the free tier).

### 3. Cron

[`vercel.json`](./vercel.json) registers a daily call to `/api/trouble/sync`
(08:00 UTC). Vercel automatically sends `Authorization: Bearer $CRON_SECRET`.

> **Note:** the schedule is daily because the Vercel Hobby plan only allows
> one cron run per day (more frequent schedules fail the build). On match days,
> use the **Sync from football-data.org** button under *Owner tools* (visible/
> working only when you're signed in to `/admin`) to update scores immediately.
> If you upgrade to Pro, you can bump the schedule to e.g. `0 * * * *` (hourly).

### 4. Arrange the bracket + set the deadline

Visit `/admin` (Google sign-in), then open `/trouble` → *Owner tools*:

1. **Sync** to load the Round-of-32 fixtures.
2. **Arrange Round of 32**: set each match's position 1–16 top-to-bottom to
   match the official bracket diagram. A bracket is fully determined by this
   order (winner of 1 plays winner of 2, 3 plays 4, …), so this is what makes
   everyone's predicted matchups accurate to the real bracket. One-time setup.
3. **Deadline**: set it to the first knockout kickoff.

You can also hard-lock or manually enter any match result here as a fallback if
the API lags.

## Owner tools (you only)

Available at the bottom of `/trouble` when signed in to `/admin`:

- Lock / unlock submissions, or set a deadline.
- **Sync** results from the API on demand.
- Manually set any match's score + winner (overrides survive future syncs until
  the API reports its own result).
