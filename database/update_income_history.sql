-- 1) new table to store snapshots
CREATE TABLE income_amount_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    income_id   uuid NOT NULL REFERENCES incomes(id) ON DELETE CASCADE,
    user_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount    numeric NOT NULL,          -- full amount at this moment
    note      text NOT NULL DEFAULT '',
    logged_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX income_amount_history_income_idx ON income_amount_history(income_id);

-- 2) row-level security
ALTER TABLE income_amount_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user reads own income history"
ON income_amount_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "user can manage own income history"
ON income_amount_history FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3) RPC helper
CREATE OR REPLACE FUNCTION update_income_amount(
    in_income_id uuid,
    in_new_amount numeric,
    in_note text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- verify ownership
    IF NOT EXISTS (
      SELECT 1 FROM incomes WHERE id = in_income_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Income not found or not owned by user';
    END IF;

    -- update master record
    UPDATE incomes
    SET amount = in_new_amount
    WHERE id = in_income_id;

    -- insert snapshot
    INSERT INTO income_amount_history (income_id, user_id, amount, note)
    VALUES (in_income_id, auth.uid(), in_new_amount, COALESCE(in_note,''));
END;
$$;
