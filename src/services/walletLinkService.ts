
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

// Type definition
export interface LinkedWallet {
  id: string;
  userId: string;
  address: string;
  createdAt: string;
}

// Initialize wallet links in localStorage if not present
const initializeWalletLinks = () => {
  if (!localStorage.getItem('walletLinks')) {
    localStorage.setItem('walletLinks', JSON.stringify([]));
  }
};

// Initialize storage
initializeWalletLinks();

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const walletLinkService = {
  // Link a wallet to a user account
  linkWallet: async (userId: string, walletAddress: string): Promise<LinkedWallet> => {
    await delay(500);
    
    try {
      // Get existing links
      const links = JSON.parse(localStorage.getItem('walletLinks') || '[]');
      
      // Check if this wallet is already linked to this user
      const existingLink = links.find((link: LinkedWallet) => 
        link.userId === userId && link.address.toLowerCase() === walletAddress.toLowerCase()
      );
      
      if (existingLink) {
        return existingLink;
      }
      
      // Create new link
      const newLink: LinkedWallet = {
        id: uuidv4(),
        userId,
        address: walletAddress,
        createdAt: new Date().toISOString()
      };
      
      // Save to storage
      localStorage.setItem('walletLinks', JSON.stringify([...links, newLink]));
      
      return newLink;
    } catch (error: any) {
      const { toast } = useToast();
      toast({
        title: "Failed to link wallet",
        description: error.message || "Could not link wallet to your account",
        variant: "destructive"
      });
      throw error;
    }
  },
  
  // Get all wallets linked to a user
  getWalletsByUser: async (userId: string): Promise<LinkedWallet[]> => {
    await delay(300);
    
    const links = JSON.parse(localStorage.getItem('walletLinks') || '[]');
    return links.filter((link: LinkedWallet) => link.userId === userId);
  },
  
  // Get user by wallet address
  getUserByWallet: async (walletAddress: string): Promise<string | null> => {
    await delay(300);
    
    const links = JSON.parse(localStorage.getItem('walletLinks') || '[]');
    const link = links.find((link: LinkedWallet) => 
      link.address.toLowerCase() === walletAddress.toLowerCase()
    );
    
    return link ? link.userId : null;
  },
  
  // Unlink a wallet from a user account
  unlinkWallet: async (userId: string, walletAddress: string): Promise<boolean> => {
    await delay(500);
    
    try {
      // Get existing links
      const links = JSON.parse(localStorage.getItem('walletLinks') || '[]');
      
      // Filter out the link we want to remove
      const updatedLinks = links.filter((link: LinkedWallet) => 
        !(link.userId === userId && link.address.toLowerCase() === walletAddress.toLowerCase())
      );
      
      // Save updated links
      localStorage.setItem('walletLinks', JSON.stringify(updatedLinks));
      
      return true;
    } catch (error: any) {
      const { toast } = useToast();
      toast({
        title: "Failed to unlink wallet",
        description: error.message || "Could not unlink wallet from your account",
        variant: "destructive"
      });
      return false;
    }
  }
};
