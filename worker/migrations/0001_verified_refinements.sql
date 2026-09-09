CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  google_uid TEXT UNIQUE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'visitor' CHECK(role IN ('owner', 'visitor')),
  created_at INTEGER NOT NULL
);
CREATE UNIQUE INDEX one_owner ON accounts(role) WHERE role = 'owner';
CREATE TABLE passkeys (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL,
  transports TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX passkeys_account ON passkeys(account_id);
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  method TEXT NOT NULL CHECK(method IN ('passkey', 'google')),
  credential_id TEXT,
  authenticated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE ceremonies (
  token_hash TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  challenge TEXT NOT NULL,
  account_id TEXT,
  display_name TEXT,
  session_hash TEXT,
  expires_at INTEGER NOT NULL
);
CREATE INDEX ceremonies_expiry ON ceremonies(expires_at);
CREATE TABLE refinements (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  payload TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX refinements_account_date ON refinements(account_id, created_at DESC);
CREATE TABLE request_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE INDEX limits_expiry ON request_limits(expires_at);
