CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE currency_code AS ENUM ('USD','TRY');
CREATE TYPE debt_status AS ENUM ('pending','paid');
CREATE TYPE debt_type AS ENUM ('short','long');
CREATE TYPE expense_status AS ENUM ('paid','pending');
CREATE TYPE expense_type AS ENUM ('fixed','variable');
CREATE TYPE income_status AS ENUM ('expected','received');

-- User profile table extending auth.users
CREATE TABLE profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Assets owned by user
CREATE TABLE assets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type text NOT NULL,
    quantity numeric NOT NULL,
    unit text NOT NULL,
    price_per_unit numeric NOT NULL,
    currency currency_code NOT NULL,
    total_value numeric GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
    auto_update boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX assets_user_idx ON assets(user_id);

-- Debts table
CREATE TABLE debts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    creditor text NOT NULL,
    amount numeric NOT NULL,
    currency currency_code NOT NULL,
    due_date date,
    status debt_status NOT NULL DEFAULT 'pending',
    type debt_type NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX debts_user_idx ON debts(user_id);

-- Expenses table
CREATE TABLE expenses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    category text NOT NULL,
    amount numeric NOT NULL,
    currency currency_code NOT NULL,
    date date NOT NULL,
    status expense_status NOT NULL DEFAULT 'paid',
    type expense_type NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX expenses_user_idx ON expenses(user_id);

-- Incomes table
CREATE TABLE incomes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    amount numeric NOT NULL,
    currency currency_code NOT NULL,
    category text NOT NULL,
    status income_status NOT NULL DEFAULT 'expected',
    date date NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX incomes_user_idx ON incomes(user_id);

-- User preferences
CREATE TABLE user_settings (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_currency currency_code NOT NULL DEFAULT 'USD',
    auto_convert boolean NOT NULL DEFAULT true,
    theme text NOT NULL DEFAULT 'system',
    include_long_term boolean NOT NULL DEFAULT true,
    auto_price_update boolean NOT NULL DEFAULT true,
    language text NOT NULL DEFAULT 'en'
);
