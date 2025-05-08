
// Simple interface for NFT contract interactions
import { ethers } from 'ethers';

// ABI for a basic ERC721 NFT contract
export const NFT_CONTRACT_ABI = [
  // Basic ERC721 functions
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  
  // Transfer functions
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  
  // Mint function (custom for our use case)
  "function mint(address to, string memory tokenURI) returns (uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
];

// Sepolia testnet contract address (this would be your deployed contract)
export const NFT_CONTRACT_ADDRESS = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";

// Helper to get contract instance
export const getNFTContract = (provider: ethers.BrowserProvider, signer?: ethers.Signer) => {
  if (signer) {
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer);
  }
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, provider);
};
