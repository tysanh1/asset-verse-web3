import { supabase } from "@/integrations/supabase/client";

export const walletLinkService = {
  linkWalletToUser: async (userId: string, walletAddress: string) => {
    try {
      // Check if this wallet is already linked to this user
      const { data: existingLinks, error: fetchError } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId)
        .eq('wallet_address', walletAddress);
        
      if (fetchError) throw fetchError;
      
      // If this wallet is already linked to this user, don't create a duplicate
      if (existingLinks && existingLinks.length > 0) {
        return existingLinks[0];
      }
      
      // Otherwise, create a new link
      const { data, error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          wallet_address: walletAddress,
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error linking wallet to user:', error);
      throw error;
    }
  },
  
  getUserWallets: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error getting user wallets:', error);
      throw error;
    }
  },
  
  getUserByWallet: async (walletAddress: string) => {
    try {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('user_id')
        .eq('wallet_address', walletAddress)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw error;
      }
      
      return data.user_id;
    } catch (error) {
      console.error('Error getting user by wallet:', error);
      throw error;
    }
  },
  
  unlinkWallet: async (userId: string, walletAddress: string) => {
    try {
      const { error } = await supabase
        .from('user_wallets')
        .delete()
        .eq('user_id', userId)
        .eq('wallet_address', walletAddress);
        
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error unlinking wallet:', error);
      throw error;
    }
  }
};
