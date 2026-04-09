-- Tabla de transacciones financieras de Tenpistas
CREATE TABLE transactions (
    id               BIGSERIAL    PRIMARY KEY,
    amount           INTEGER      NOT NULL CHECK (amount > 0),
    commerce_name    VARCHAR(255) NOT NULL,
    tenpista_name    VARCHAR(255) NOT NULL,
    transaction_date TIMESTAMPTZ  NOT NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Índices para mejorar rendimiento en filtros y ordenamiento
CREATE INDEX idx_transactions_tenpista_name    ON transactions(tenpista_name);
CREATE INDEX idx_transactions_transaction_date ON transactions(transaction_date DESC);
