
import { NFT, Transaction, NFTFormData } from '@/types/nft';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

export const supabaseNFTService = {
  getNFTsByOwner: async (owner: string): Promise<NFT[]> => {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('owner_id', owner);

    if (error) {
      console.error('Error fetching NFTs by owner:', error);
      throw error;
    }

    // Transform from Supabase format to our app format
    return data.map(item => ({
      id: item.token_id,
      name: item.name,
      description: item.description || '',
      image: item.image_url,
      owner: item.owner_id,
      creator: item.creator_id,
      tokenURI: item.metadata_url,
      createdAt: item.created_at,
    }));
  },

  getAllNFTs: async (): Promise<NFT[]> => {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all NFTs:', error);
      throw error;
    }

    // Transform from Supabase format to our app format
    return data.map(item => ({
      id: item.token_id,
      name: item.name,
      description: item.description || '',
      image: item.image_url,
      owner: item.owner_id,
      creator: item.creator_id,
      tokenURI: item.metadata_url,
      createdAt: item.created_at,
    }));
  },

  getNFTById: async (id: string): Promise<NFT | null> => {
    const { data, error } = await supabase
      .from('nfts')
      .select('*')
      .eq('token_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Code for no rows returned
        return null;
      }
      console.error('Error fetching NFT by ID:', error);
      throw error;
    }

    // Transform from Supabase format to our app format
    return {
      id: data.token_id,
      name: data.name,
      description: data.description || '',
      image: data.image_url,
      owner: data.owner_id,
      creator: data.creator_id,
      tokenURI: data.metadata_url,
      createdAt: data.created_at,
    };
  },

  createNFT: async (data: NFTFormData, creator: string): Promise<NFT> => {
    // In a real app, upload the image to IPFS/Supabase Storage
    let imageUrl = 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFic3RyYWN0fGVufDB8fDB8fHww';
    
    if (data.image) {
      // Upload to Supabase Storage (in production)
      const file = data.image;
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `nft-images/${fileName}`;
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('nft-assets')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from('nft-assets')
        .getPublicUrl(filePath);
        
      imageUrl = urlData.publicUrl;
    }
    
    // Generate a token ID (in a real app, this would come from the blockchain)
    const tokenId = uuidv4();
    
    // Create a metadata URL (in a real app, this would be IPFS URL)
    const metadataUrl = `ipfs://mock/${tokenId}`;
    
    // Current time
    const createdAt = new Date().toISOString();
    
    // Insert into Supabase
    const { data: nftData, error } = await supabase
      .from('nfts')
      .insert({
        token_id: tokenId,
        name: data.name,
        description: data.description || '',
        image_url: imageUrl,
        owner_id: creator,
        creator_id: creator,
        metadata_url: metadataUrl,
        price: 0, // Default price
        royalty_percentage: 0, // Default royalty
        category: 'art', // Default category
        status: 'active',
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating NFT:', error);
      throw error;
    }
    
    // Create a mint transaction
    const transactionId = uuidv4();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        nft_id: tokenId,
        transaction_hash: `0x${Math.random().toString(16).substring(2, 10)}`,
        transaction_type: 'mint',
        seller_id: '0x0000000000000000000000000000000000000000', // For minting
        buyer_id: creator,
        price: 0, // Mint price is 0
      });
      
    if (txError) {
      console.error('Error creating transaction:', txError);
      // Don't throw here, we already have the NFT created
    }
    
    // Return in the app's format
    return {
      id: nftData.token_id,
      name: nftData.name,
      description: nftData.description || '',
      image: nftData.image_url,
      owner: nftData.owner_id,
      creator: nftData.creator_id,
      tokenURI: nftData.metadata_url,
      createdAt: nftData.created_at,
    };
  },

  transferNFT: async (from: string, to: string, tokenId: string): Promise<boolean> => {
    // Check ownership
    const { data: nftData, error: nftError } = await supabase
      .from('nfts')
      .select('*')
      .eq('token_id', tokenId)
      .single();
      
    if (nftError) {
      console.error('Error fetching NFT for transfer:', nftError);
      return false;
    }
    
    if (nftData.owner_id !== from) {
      console.error('Transfer failed: Not the owner');
      return false;
    }
    
    // Update ownership
    const { error: updateError } = await supabase
      .from('nfts')
      .update({ owner_id: to })
      .eq('token_id', tokenId);
      
    if (updateError) {
      console.error('Error updating NFT ownership:', updateError);
      return false;
    }
    
    // Create a transfer transaction
    const transactionId = uuidv4();
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        id: transactionId,
        nft_id: tokenId,
        transaction_hash: `0x${Math.random().toString(16).substring(2, 10)}`,
        transaction_type: 'transfer',
        seller_id: from,
        buyer_id: to,
        price: 0, // Free transfer
      });
      
    if (txError) {
      console.error('Error creating transfer transaction:', txError);
      // Don't throw here, we already updated the ownership
    }
    
    return true;
  },

  getTransactionsByUser: async (address: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .or(`buyer_id.eq.${address},seller_id.eq.${address}`)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching user transactions:', error);
      throw error;
    }
    
    // Transform to app format
    return data.map(tx => ({
      hash: tx.transaction_hash,
      from: tx.seller_id,
      to: tx.buyer_id,
      tokenId: tx.nft_id,
      timestamp: tx.created_at,
      type: tx.transaction_type as 'mint' | 'transfer',
    }));
  },

  getTransactionsByNFT: async (tokenId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('nft_id', tokenId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching NFT transactions:', error);
      throw error;
    }
    
    // Transform to app format
    return data.map(tx => ({
      hash: tx.transaction_hash,
      from: tx.seller_id,
      to: tx.buyer_id,
      tokenId: tx.nft_id,
      timestamp: tx.created_at,
      type: tx.transaction_type as 'mint' | 'transfer',
    }));
  }
};
