CREATE TABLE relay_profiles (
  account_id TEXT PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  handle_key TEXT NOT NULL UNIQUE,
  discord_thread_id TEXT UNIQUE,
  thread_claimed_at INTEGER,
  disclosure_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE relay_dispatches (
  request_id TEXT PRIMARY KEY,
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL,
  sender_label TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('pending', 'delivered')),
  discord_thread_id TEXT,
  discord_message_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX relay_dispatches_account_date ON relay_dispatches(account_id, created_at DESC);
