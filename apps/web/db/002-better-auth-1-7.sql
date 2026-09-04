-- Required by Better Auth 1.7 credential-account identity strategy.
-- Kept separate because the legacy CLI package may omit this column.
ALTER TABLE account
  ADD COLUMN IF NOT EXISTS issuer text NOT NULL DEFAULT 'local:credential';

CREATE UNIQUE INDEX IF NOT EXISTS account_issuer_account_id_key
  ON account (issuer, "accountId");
