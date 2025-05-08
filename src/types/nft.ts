
export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  tokenURI: string;
  createdAt: string;
  // Optional blockchain-related fields
  contractAddress?: string;
  tokenId?: string;
  blockNumber?: number;
}

export interface NFTFormData {
  name: string;
  description: string;
  image: File | null;
}

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  tokenId: string;
  timestamp: string;
  type: 'mint' | 'transfer';
  // Optional blockchain-related fields
  blockNumber?: number;
  gasUsed?: string;
  confirmations?: number;
}

export interface SmartContractConfig {
  address: string;
  abi: any[];
  chainId: number;
}
