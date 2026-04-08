-- =============================================================================
-- SecureBank — Oracle Database Initialization Script
-- Compatible with gvenzl/oracle-xe:21-slim
-- The APP_USER (banking_user) is created automatically by the Docker image.
-- This script runs as SYSTEM; it grants privileges and creates all tables.
-- =============================================================================

GRANT CREATE SESSION        TO banking_user;
GRANT CREATE TABLE          TO banking_user;
GRANT CREATE SEQUENCE       TO banking_user;
GRANT CREATE VIEW           TO banking_user;
GRANT CREATE TRIGGER        TO banking_user;
GRANT CREATE PROCEDURE      TO banking_user;
GRANT UNLIMITED TABLESPACE  TO banking_user;

ALTER SESSION SET CURRENT_SCHEMA = banking_user;

-- =============================================================================
-- USERS
-- =============================================================================
CREATE TABLE users (
    user_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    first_name    VARCHAR2(100) NOT NULL,
    last_name     VARCHAR2(100) NOT NULL,
    phone         VARCHAR2(20),
    role          VARCHAR2(20)  DEFAULT 'CUSTOMER' NOT NULL,
    is_active     NUMBER(1)     DEFAULT 1           NOT NULL,
    created_at    TIMESTAMP     DEFAULT SYSTIMESTAMP,
    updated_at    TIMESTAMP     DEFAULT SYSTIMESTAMP
);

-- =============================================================================
-- REFRESH TOKENS
-- =============================================================================
CREATE TABLE refresh_tokens (
    token_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id    NUMBER        NOT NULL,
    token      VARCHAR2(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP     NOT NULL,
    revoked    NUMBER(1)     DEFAULT 0 NOT NULL,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================================================
-- ACCOUNTS  (includes checking-account application fields)
-- =============================================================================
CREATE TABLE accounts (
    account_id             NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id                NUMBER       NOT NULL,
    account_number         VARCHAR2(20) NOT NULL UNIQUE,
    account_type           VARCHAR2(20) NOT NULL,
    balance                NUMBER(15,2) DEFAULT 0 NOT NULL,
    currency               VARCHAR2(3)  DEFAULT 'USD',
    status                 VARCHAR2(20) DEFAULT 'ACTIVE',
    -- Checking account application fields
    first_name             VARCHAR2(100),
    last_name              VARCHAR2(100),
    date_of_birth          DATE,
    ssn_last4              VARCHAR2(4),
    country_of_citizenship VARCHAR2(100),
    phone_number           VARCHAR2(20),
    street_address         VARCHAR2(255),
    city                   VARCHAR2(100),
    state                  VARCHAR2(50),
    zip_code               VARCHAR2(10),
    annual_income          NUMBER(15,2),
    employment_status      VARCHAR2(30),
    created_at             TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_acct_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================================================
-- TRANSACTIONS
-- =============================================================================
CREATE TABLE transactions (
    txn_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    from_account_id NUMBER,
    to_account_id   NUMBER,
    amount          NUMBER(15,2) NOT NULL,
    txn_type        VARCHAR2(20) NOT NULL,
    status          VARCHAR2(20) DEFAULT 'PENDING',
    reference_no    VARCHAR2(50) NOT NULL UNIQUE,
    description     VARCHAR2(500),
    created_at      TIMESTAMP    DEFAULT SYSTIMESTAMP,
    processed_at    TIMESTAMP,
    CONSTRAINT fk_txn_from FOREIGN KEY (from_account_id) REFERENCES accounts(account_id),
    CONSTRAINT fk_txn_to   FOREIGN KEY (to_account_id)   REFERENCES accounts(account_id)
);

-- =============================================================================
-- PAYMENTS (Bill Pay)
-- =============================================================================
CREATE TABLE payments (
    payment_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id        NUMBER        NOT NULL,
    account_id     NUMBER        NOT NULL,
    payee_name     VARCHAR2(255) NOT NULL,
    amount         NUMBER(15,2)  NOT NULL,
    scheduled_date DATE,
    status         VARCHAR2(30)  DEFAULT 'SCHEDULED',
    created_at     TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_pay_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)    ON DELETE CASCADE,
    CONSTRAINT fk_pay_account FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

-- =============================================================================
-- CREDIT CARDS
-- =============================================================================
CREATE TABLE credit_cards (
    card_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id          NUMBER        NOT NULL,
    card_number      VARCHAR2(20)  NOT NULL UNIQUE,
    card_type        VARCHAR2(20)  DEFAULT 'STANDARD' NOT NULL,
    credit_limit     NUMBER(15,2)  NOT NULL,
    current_balance  NUMBER(15,2)  DEFAULT 0,
    available_credit NUMBER(15,2),
    due_date         DATE,
    minimum_payment  NUMBER(15,2)  DEFAULT 0,
    status           VARCHAR2(20)  DEFAULT 'ACTIVE',
    reward_points    NUMBER        DEFAULT 0,
    created_at       TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_cc_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================================================
-- REWARDS
-- =============================================================================
CREATE TABLE rewards (
    reward_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id         NUMBER       NOT NULL UNIQUE,
    total_points    NUMBER       DEFAULT 0,
    lifetime_points NUMBER       DEFAULT 0,
    tier            VARCHAR2(20) DEFAULT 'BASIC',
    last_updated    TIMESTAMP    DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_rew_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================================================
-- REWARD TRANSACTIONS
-- =============================================================================
CREATE TABLE reward_transactions (
    reward_txn_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       NUMBER        NOT NULL,
    points        NUMBER        NOT NULL,
    txn_type      VARCHAR2(20)  NOT NULL,
    description   VARCHAR2(500),
    reference_id  VARCHAR2(100),
    created_at    TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_rtxn_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- =============================================================================
-- ZELLE TRANSFERS
-- =============================================================================
CREATE TABLE zelle_transfers (
    transfer_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sender_id       NUMBER        NOT NULL,
    from_account_id NUMBER        NOT NULL,
    recipient_email VARCHAR2(255),
    recipient_phone VARCHAR2(20),
    recipient_name  VARCHAR2(255),
    amount          NUMBER(15,2)  NOT NULL,
    note            VARCHAR2(500),
    direction       VARCHAR2(10)  DEFAULT 'SENT' NOT NULL,
    status          VARCHAR2(20)  DEFAULT 'COMPLETED',
    created_at      TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT fk_zt_sender  FOREIGN KEY (sender_id)       REFERENCES users(user_id)    ON DELETE CASCADE,
    CONSTRAINT fk_zt_account FOREIGN KEY (from_account_id) REFERENCES accounts(account_id)
);

-- =============================================================================
-- AUDIT LOG
-- =============================================================================
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

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX idx_acct_user          ON accounts(user_id);
CREATE INDEX idx_txn_from           ON transactions(from_account_id);
CREATE INDEX idx_txn_to             ON transactions(to_account_id);
CREATE INDEX idx_txn_status         ON transactions(status);
CREATE INDEX idx_pay_user           ON payments(user_id);
CREATE INDEX idx_pay_account        ON payments(account_id);
CREATE INDEX idx_cc_user            ON credit_cards(user_id);
CREATE INDEX idx_rew_txn_user       ON reward_transactions(user_id);
CREATE INDEX idx_zt_sender          ON zelle_transfers(sender_id);
CREATE INDEX idx_rt_user            ON refresh_tokens(user_id);

-- =============================================================================
-- SEED: Default ADMIN user
-- Password: Admin@123  (BCrypt 12 rounds — change in production!)
-- =============================================================================
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active)
VALUES (
    'admin@securebank.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2e',
    'Admin', 'User', 'ADMIN', 1
);

COMMIT;
