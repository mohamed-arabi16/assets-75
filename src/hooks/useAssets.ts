import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Type definition
export interface Asset {
  id: string;
  user_id: string;
  type: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  currency: string;
  auto_update: boolean;
  created_at?: string;
}

// 1. Hook to fetch all assets
const fetchAssets = async (userId: string) => {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Asset[];
};

export const useAssets = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['assets', user?.id],
    queryFn: () => fetchAssets(user!.id),
    enabled: !!user,
  });
};

// 2. Hook to add a new asset
type NewAsset = Omit<Asset, 'id' | 'created_at'>;

const addAsset = async (newAsset: NewAsset) => {
  const { data, error } = await supabase
    .from('assets')
    .insert([newAsset])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Asset;
};

export const useAddAsset = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: addAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', user?.id] });
    },
  });
};

// 3. Hook to update an existing asset
const updateAsset = async (updatedAsset: Partial<Asset> & { id: string }) => {
  const { data, error } = await supabase
    .from('assets')
    .update(updatedAsset)
    .eq('id', updatedAsset.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Asset;
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: updateAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', user?.id] });
    },
  });
};

// 4. Hook to delete an asset
const deleteAsset = async (assetId: string) => {
  const { error } = await supabase
    .from('assets')
    .delete()
    .eq('id', assetId);

  if (error) throw new Error(error.message);
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', user?.id] });
    },
  });
};
