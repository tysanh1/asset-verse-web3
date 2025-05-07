
export interface NFT {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  creator: string;
  tokenURI: string;
  createdAt: string;
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
}
