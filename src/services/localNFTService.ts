
import { NFT, Transaction, NFTFormData } from '@/types/nft';
import { v4 as uuidv4 } from 'uuid';

// Initial sample data
const initialNFTs: NFT[] = [
  {
    id: '1',
    name: 'Cosmic Explorer',
    description: 'A journey through the stars and beyond',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWJzdHJhY3R8ZW58MHx8MHx8fDA%3D',
    owner: '0x1234567890123456789012345678901234567890',
    creator: '0x1234567890123456789012345678901234567890',
    tokenURI: 'ipfs://mock/1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Digital Landscape',
    description: 'Virtual world reimagined in vibrant colors',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YWJzdHJhY3R8ZW58MHx8MHx8fDA%3D',
    owner: '0x1234567890123456789012345678901234567890',
    creator: '0x0987654321098765432109876543210987654321',
    tokenURI: 'ipfs://mock/2',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Neon Dreams',
    description: 'Cyberpunk inspired digital artwork',
    image: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFic3RyYWN0fGVufDB8fDB8fHww',
    owner: '0x1234567890123456789012345678901234567890',
    creator: '0x1234567890123456789012345678901234567890',
    tokenURI: 'ipfs://mock/3',
    createdAt: new Date().toISOString(),
  },
];

const initialTransactions: Transaction[] = [
  {
    hash: '0xabc123',
    from: '0x0000000000000000000000000000000000000000',
    to: '0x1234567890123456789012345678901234567890',
    tokenId: '1',
    timestamp: new Date().toISOString(),
    type: 'mint',
  },
  {
    hash: '0xdef456',
    from: '0x0000000000000000000000000000000000000000',
    to: '0x1234567890123456789012345678901234567890',
    tokenId: '2',
    timestamp: new Date().toISOString(),
    type: 'mint',
  },
  {
    hash: '0xghi789',
    from: '0x0000000000000000000000000000000000000000',
    to: '0x1234567890123456789012345678901234567890',
    tokenId: '3',
    timestamp: new Date().toISOString(),
    type: 'mint',
  },
];

// Initialize localStorage with initial data if empty
const initializeStorage = () => {
  if (!localStorage.getItem('nfts')) {
    localStorage.setItem('nfts', JSON.stringify(initialNFTs));
  }
  
  if (!localStorage.getItem('transactions')) {
    localStorage.setItem('transactions', JSON.stringify(initialTransactions));
  }
};

// Call initialization
initializeStorage();

// Simulated delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const localNFTService = {
  getNFTsByOwner: async (owner: string): Promise<NFT[]> => {
    await delay(500);
    const nfts = JSON.parse(localStorage.getItem('nfts') || '[]');
    return nfts.filter((nft: NFT) => nft.owner.toLowerCase() === owner.toLowerCase());
  },

  getAllNFTs: async (): Promise<NFT[]> => {
    await delay(500);
    return JSON.parse(localStorage.getItem('nfts') || '[]');
  },

  getNFTById: async (id: string): Promise<NFT | null> => {
    await delay(300);
    const nfts = JSON.parse(localStorage.getItem('nfts') || '[]');
    const nft = nfts.find((nft: NFT) => nft.id === id);
    return nft || null;
  },

  createNFT: async (data: NFTFormData, creator: string): Promise<NFT> => {
    await delay(1000);
    const nfts = JSON.parse(localStorage.getItem('nfts') || '[]');
    const id = (nfts.length + 1).toString();
    
    let imageUrl = 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFic3RyYWN0fGVufDB8fDB8fHww';
    
    // If there's an image, use object URL (in a real app, would upload to IPFS)
    if (data.image) {
      imageUrl = URL.createObjectURL(data.image);
    }
    
    const newNFT: NFT = {
      id,
      name: data.name,
      description: data.description,
      image: imageUrl,
      owner: creator,
      creator,
      tokenURI: `ipfs://mock/${id}`,
      createdAt: new Date().toISOString(),
    };
    
    // Save the updated NFTs
    localStorage.setItem('nfts', JSON.stringify([...nfts, newNFT]));
    
    // Create a mint transaction
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransaction: Transaction = {
      hash: `0x${Math.random().toString(16).substring(2, 10)}`,
      from: '0x0000000000000000000000000000000000000000',
      to: creator,
      tokenId: id,
      timestamp: new Date().toISOString(),
      type: 'mint',
    };
    
    // Save the updated transactions
    localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]));
    
    return newNFT;
  },

  transferNFT: async (from: string, to: string, tokenId: string): Promise<boolean> => {
    await delay(800);
    const nfts = JSON.parse(localStorage.getItem('nfts') || '[]');
    const nftIndex = nfts.findIndex((nft: NFT) => nft.id === tokenId);
    
    if (nftIndex === -1) {
      return false;
    }
    
    if (nfts[nftIndex].owner.toLowerCase() !== from.toLowerCase()) {
      return false;
    }
    
    // Update ownership
    nfts[nftIndex] = { ...nfts[nftIndex], owner: to };
    localStorage.setItem('nfts', JSON.stringify(nfts));
    
    // Create a transfer transaction
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransaction: Transaction = {
      hash: `0x${Math.random().toString(16).substring(2, 10)}`,
      from,
      to,
      tokenId,
      timestamp: new Date().toISOString(),
      type: 'transfer',
    };
    
    // Save the updated transactions
    localStorage.setItem('transactions', JSON.stringify([...transactions, newTransaction]));
    
    return true;
  },

  getTransactionsByUser: async (address: string): Promise<Transaction[]> => {
    await delay(500);
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions
      .filter((tx: Transaction) => 
        tx.from.toLowerCase() === address.toLowerCase() || 
        tx.to.toLowerCase() === address.toLowerCase()
      )
      .sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getTransactionsByNFT: async (tokenId: string): Promise<Transaction[]> => {
    await delay(500);
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    return transactions
      .filter((tx: Transaction) => tx.tokenId === tokenId)
      .sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};
