import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Type definitions
export interface DebtAmountHistory {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  note: string;
  logged_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  title: string;
  creditor: string;
  amount: number;
  currency: string;
  due_date: string | null;
  status: 'pending' | 'paid';
  type: 'short' | 'long';
  created_at?: string;
  debt_amount_history: DebtAmountHistory[];
}

// 1. Hook to fetch all debts
const fetchDebts = async (userId: string) => {
  const { data, error } = await supabase
    .from('debts')
    .select('*, debt_amount_history(*)')
    .eq('user_id', userId)
    .order('due_date', { ascending: true });

  if (error) throw new Error(error.message);
  return data as Debt[];
};

export const useDebts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['debts', user?.id],
    queryFn: () => fetchDebts(user!.id),
    enabled: !!user,
  });
};

// 2. Hook to add a new debt
type NewDebt = Omit<Debt, 'id' | 'created_at' | 'debt_amount_history' | 'amount'> & { amount: number };

const addDebt = async (newDebt: NewDebt) => {
    const { data, error } = await supabase
        .from('debts')
        .insert([newDebt])
        .select('*, debt_amount_history(*)')
        .single();

    if (error) throw new Error(error.message);
    return data as Debt;
};

export const useAddDebt = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: addDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
  });
};

// 3. Hook to update an existing debt (uses RPC for amount changes)
interface UpdateDebtPayload {
    id: string;
    title: string;
    creditor: string;
    due_date: string | null;
    status: 'pending' | 'paid';
    currency: string;
    amount: number;
    note?: string;
}

const updateDebt = async (payload: UpdateDebtPayload) => {
    // Update basic fields first
    const { error: updateError } = await supabase
      .from('debts')
      .update({
        title: payload.title,
        creditor: payload.creditor,
        due_date: payload.due_date,
        status: payload.status,
        currency: payload.currency,
      })
      .eq('id', payload.id);

    if (updateError) throw new Error(updateError.message);

    // Then, update amount via RPC to maintain history
    const { error: rpcError } = await supabase.rpc('update_debt_amount', {
      in_debt_id: payload.id,
      in_new_amount: payload.amount,
      in_note: payload.note || 'Updated amount',
    });

    if (rpcError) throw new Error(rpcError.message);
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
  });
};

// 4. Hook to delete a debt
const deleteDebt = async (debtId: string) => {
  const { error } = await supabase
    .from('debts')
    .delete()
    .eq('id', debtId);

  if (error) throw new Error(error.message);
};

export const useDeleteDebt = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts', user?.id] });
    },
  });
};
