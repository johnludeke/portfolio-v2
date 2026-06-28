-- World Cup bracket challenge ("/trouble") schema
-- Run this in the Supabase SQL editor.
-- RLS is left disabled to match the existing `posts` table approach; all
-- writes go through server route handlers using the anon key. This is a
-- low-stakes friends game, not a secure app.

-- Bracket entrants -----------------------------------------------------------
CREATE TABLE wc_players (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username         TEXT UNIQUE NOT NULL,
  password         TEXT NOT NULL,          -- plaintext on purpose, not secure
  bracket_name     TEXT NOT NULL DEFAULT '',
  picks            JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { "R32-0": "BRA", ... "F-0": "BRA" }
  final_goals      INT,                    -- tiebreaker: predicted total goals in the final
  submitted        BOOLEAN NOT NULL DEFAULT false,
  score            INT NOT NULL DEFAULT 0, -- cached, recomputed on each sync
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Actual knockout matches (mirrors results from football-data.org) -----------
CREATE TABLE wc_matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id      BIGINT UNIQUE,                 -- football-data.org match id (null for manual)
  round       TEXT NOT NULL,                 -- R32 | R16 | QF | SF | F
  ord         INT NOT NULL DEFAULT 0,        -- ordering within the round (R32 editor seed order)
  home        JSONB,                         -- { name, tla, crest }
  away        JSONB,
  home_score  INT,
  away_score  INT,
  winner_tla  TEXT,                          -- tla of the winning team, null until decided
  status      TEXT NOT NULL DEFAULT 'SCHEDULED',  -- SCHEDULED | IN_PLAY | FINISHED
  kickoff     TIMESTAMPTZ,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX wc_matches_round_idx ON wc_matches (round, ord);

-- Singleton config row -------------------------------------------------------
CREATE TABLE wc_meta (
  id              INT PRIMARY KEY DEFAULT 1,
  locked          BOOLEAN NOT NULL DEFAULT false,  -- manual hard lock
  lock_at         TIMESTAMPTZ,                      -- global submission deadline
  last_synced_at  TIMESTAMPTZ,
  CONSTRAINT wc_meta_singleton CHECK (id = 1)
);

INSERT INTO wc_meta (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
