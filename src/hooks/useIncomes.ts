import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Define the Income type, consistent with the database schema
interface Income {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  category: string;
  status: 'expected' | 'received';
  date: string;
  created_at?: string;
}

// 1. Hook to fetch all incomes for the current user
const fetchIncomes = async (userId: string) => {
  const { data, error } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Income[];
};

export const useIncomes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['incomes', user?.id],
    queryFn: () => fetchIncomes(user!.id),
    enabled: !!user,
  });
};

// 2. Hook to add a new income
const addIncome = async (newIncome: Omit<Income, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('incomes')
    .insert([newIncome])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Income;
};

export const useAddIncome = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: addIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', user?.id] });
    },
  });
};

// 3. Hook to update an existing income
const updateIncome = async (updatedIncome: Partial<Income> & { id: string }) => {
  const { data, error } = await supabase
    .from('incomes')
    .update(updatedIncome)
    .eq('id', updatedIncome.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Income;
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateIncome,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['incomes', user?.id] });
      // Optionally, you can update the specific query cache
      // queryClient.setQueryData(['incomes', user?.id, data.id], data);
    },
  });
};

// 4. Hook to delete an income
const deleteIncome = async (incomeId: string) => {
  const { error } = await supabase
    .from('incomes')
    .delete()
    .eq('id', incomeId);

  if (error) throw new Error(error.message);
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incomes', user?.id] });
    },
  });
};
