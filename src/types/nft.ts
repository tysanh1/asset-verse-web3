
export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  tokenURI: string;
  createdAt: string;
  // Blockchain-related fields
  contractAddress?: string;
  tokenId?: string;
  blockNumber?: number;
  chainId?: number;
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
  // Blockchain-related fields
  blockNumber?: number;
  gasUsed?: string;
  confirmations?: number;
  chainId?: number;
}

export interface SmartContractConfig {
  address: string;
  abi: any[];
  chainId: number;
  name?: string;
  symbol?: string;
}

export interface NetworkConfig {
  chainId: number;
  name: string;
  currency: string;
  rpcUrl: string;
  blockExplorer: string;
  isTestnet: boolean;
}
