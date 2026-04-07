-- ============================================================
-- Banking Application - Oracle Database Schema
-- ============================================================

-- Users table
CREATE TABLE users (
  user_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email         VARCHAR2(255) UNIQUE NOT NULL,
  password_hash VARCHAR2(255) NOT NULL,
  first_name    VARCHAR2(100) NOT NULL,
  last_name     VARCHAR2(100) NOT NULL,
  phone         VARCHAR2(20),
  role          VARCHAR2(20) DEFAULT 'CUSTOMER',
  is_active     NUMBER(1) DEFAULT 1,
  created_at    TIMESTAMP DEFAULT SYSTIMESTAMP,
  updated_at    TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- Accounts table
CREATE TABLE accounts (
  account_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        NUMBER NOT NULL,
  account_number VARCHAR2(20) UNIQUE NOT NULL,
  account_type   VARCHAR2(20) NOT NULL,
  balance        NUMBER(15,2) DEFAULT 0,
  currency       VARCHAR2(3) DEFAULT 'USD',
  status         VARCHAR2(20) DEFAULT 'ACTIVE',
  created_at     TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Transactions table
CREATE TABLE transactions (
  txn_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  from_account_id  NUMBER,
  to_account_id    NUMBER,
  amount           NUMBER(15,2) NOT NULL,
  txn_type         VARCHAR2(20) NOT NULL,
  status           VARCHAR2(20) DEFAULT 'PENDING',
  reference_no     VARCHAR2(50) UNIQUE NOT NULL,
  description      VARCHAR2(255),
  created_at       TIMESTAMP DEFAULT SYSTIMESTAMP,
  processed_at     TIMESTAMP,
  CONSTRAINT fk_txn_from_account FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
  CONSTRAINT fk_txn_to_account   FOREIGN KEY (to_account_id)   REFERENCES accounts(account_id)
);

-- Payments / Bill Pay table
CREATE TABLE payments (
  payment_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id        NUMBER NOT NULL,
  account_id     NUMBER NOT NULL,
  payee_name     VARCHAR2(255) NOT NULL,
  amount         NUMBER(15,2) NOT NULL,
  scheduled_date DATE,
  status         VARCHAR2(20) DEFAULT 'SCHEDULED',
  created_at     TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_payments_user    FOREIGN KEY (user_id)    REFERENCES users(user_id),
  CONSTRAINT fk_payments_account FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

-- Audit Log table
CREATE TABLE audit_log (
  log_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     NUMBER,
  action      VARCHAR2(100) NOT NULL,
  entity_type VARCHAR2(50),
  entity_id   NUMBER,
  ip_address  VARCHAR2(45),
  created_at  TIMESTAMP DEFAULT SYSTIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Refresh Tokens table
CREATE TABLE refresh_tokens (
  token_id    NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     NUMBER NOT NULL,
  token       VARCHAR2(500) UNIQUE NOT NULL,
  expires_at  TIMESTAMP NOT NULL,
  revoked     NUMBER(1) DEFAULT 0,
  CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes
CREATE INDEX idx_accounts_user_id     ON accounts(user_id);
CREATE INDEX idx_txn_from_account     ON transactions(from_account_id);
CREATE INDEX idx_txn_to_account       ON transactions(to_account_id);
CREATE INDEX idx_txn_status           ON transactions(status);
CREATE INDEX idx_payments_user_id     ON payments(user_id);
CREATE INDEX idx_audit_log_user_id    ON audit_log(user_id);
CREATE INDEX idx_refresh_token_user   ON refresh_tokens(user_id);

COMMIT;
