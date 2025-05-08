
import { ethers } from 'ethers';
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from '../contracts/NFTContract';
import { NFT, Transaction } from '@/types/nft';
import { v4 as uuidv4 } from 'uuid';
import { localNFTService } from './localNFTService';

// Helper to check if window.ethereum is available
const isEthereumAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Get ethers provider
const getProvider = async () => {
  if (!isEthereumAvailable()) {
    throw new Error("Ethereum provider not found. Please install MetaMask.");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// Get signer for transactions
const getSigner = async () => {
  const provider = await getProvider();
  return provider.getSigner();
};

export const smartContractService = {
  // Connect to wallet and return address
  connectWallet: async (): Promise<string> => {
    if (!isEthereumAvailable()) {
      throw new Error("Ethereum provider not found. Please install MetaMask.");
    }
    
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      throw new Error(error.message || "Failed to connect wallet");
    }
  },
  
  // Get NFT contract
  getContract: async (needSigner = false) => {
    const provider = await getProvider();
    
    if (needSigner) {
      const signer = await getSigner();
      return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
    }
    
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
  },
  
  // Mint a new NFT - in real blockchain this would create on-chain
  // Here we'll use local storage but simulate blockchain operation
  mintNFT: async (data: { name: string, description: string, image: string | File }, ownerAddress: string): Promise<NFT> => {
    try {
      // In a real implementation, this would upload to IPFS first
      // and then call the contract's mint function with the tokenURI
      
      // For this demo, we'll use local storage but simulate the blockchain operation
      const tokenId = uuidv4();
      const timestamp = new Date().toISOString();
      
      // Create NFT metadata
      // Convert image to string URL if it's a File
      let imageUrl: string;
      if (typeof data.image === 'string') {
        imageUrl = data.image;
      } else {
        // Convert File to data URL
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(data.image as File);
        });
      }
      
      const nft: NFT = {
        id: tokenId,
        name: data.name,
        description: data.description,
        image: imageUrl,
        owner: ownerAddress,
        creator: ownerAddress,
        tokenURI: `ipfs://QmFake/${tokenId}`, // Simulated IPFS URI
        createdAt: timestamp,
      };
      
      // Create mint transaction
      const txHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const transaction: Transaction = {
        hash: txHash,
        from: ethers.ZeroAddress, // Minting comes from zero address
        to: ownerAddress,
        tokenId,
        timestamp,
        type: 'mint',
      };
      
      // Store in local storage for demo
      const existingNFTs = JSON.parse(localStorage.getItem('nfts') || '[]');
      localStorage.setItem('nfts', JSON.stringify([...existingNFTs, nft]));
      
      const existingTxs = JSON.parse(localStorage.getItem('transactions') || '[]');
      localStorage.setItem('transactions', JSON.stringify([...existingTxs, transaction]));
      
      // Log the operation
      console.log(`Minted NFT ${tokenId} to ${ownerAddress}`);
      
      return nft;
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      throw new Error(error.message || "Failed to mint NFT");
    }
  },
  
  // Transfer NFT - simulate blockchain transfer
  transferNFT: async (from: string, to: string, tokenId: string): Promise<boolean> => {
    try {
      // Simulate blockchain transfer
      const existingNFTs = JSON.parse(localStorage.getItem('nfts') || '[]');
      const nftIndex = existingNFTs.findIndex((nft: NFT) => nft.id === tokenId);
      
      if (nftIndex === -1) {
        throw new Error("NFT not found");
      }
      
      const nft = existingNFTs[nftIndex];
      
      if (nft.owner.toLowerCase() !== from.toLowerCase()) {
        throw new Error("Not the owner of this NFT");
      }
      
      // Update owner
      nft.owner = to;
      existingNFTs[nftIndex] = nft;
      localStorage.setItem('nfts', JSON.stringify(existingNFTs));
      
      // Create transfer transaction
      const txHash = `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const transaction: Transaction = {
        hash: txHash,
        from,
        to,
        tokenId,
        timestamp: new Date().toISOString(),
        type: 'transfer',
      };
      
      const existingTxs = JSON.parse(localStorage.getItem('transactions') || '[]');
      localStorage.setItem('transactions', JSON.stringify([...existingTxs, transaction]));
      
      // Log the operation
      console.log(`Transferred NFT ${tokenId} from ${from} to ${to}`);
      
      return true;
    } catch (error: any) {
      console.error("Error transferring NFT:", error);
      throw new Error(error.message || "Failed to transfer NFT");
    }
  },
  
  // Get NFTs owned by address
  getNFTsByOwner: async (ownerAddress: string): Promise<NFT[]> => {
    // For demo, use local storage data
    return localNFTService.getNFTsByOwner(ownerAddress);
  },
  
  // Get a specific NFT by ID
  getNFTById: async (tokenId: string): Promise<NFT | null> => {
    // For demo, use local storage data
    return localNFTService.getNFTById(tokenId);
  },
  
  // Get all transactions for an NFT
  getNFTTransactions: async (tokenId: string): Promise<Transaction[]> => {
    // For demo, use local storage data
    return localNFTService.getTransactionsByNFT(tokenId);
  }
};
