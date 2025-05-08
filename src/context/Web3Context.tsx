
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { NFT_CONTRACT_ADDRESS } from '@/contracts/NFTContract';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const { toast } = useToast();

  const initializeProvider = async () => {
    if (window.ethereum) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      return ethersProvider;
    }
    return null;
  };

  const updateSignerAndAccounts = async (ethersProvider: ethers.BrowserProvider) => {
    try {
      const accounts = await ethersProvider.listAccounts();
      if (accounts.length > 0) {
        const ethersSigner = await ethersProvider.getSigner();
        setSigner(ethersSigner);
        setAccount(accounts[0].address);
        
        const network = await ethersProvider.getNetwork();
        setChainId(Number(network.chainId));
      } else {
        setSigner(null);
        setAccount(null);
      }
    } catch (error) {
      console.error("Error getting signer or accounts:", error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const ethersProvider = await initializeProvider();
      if (ethersProvider) {
        await updateSignerAndAccounts(ethersProvider);
      }
    } catch (error) {
      console.error('Error checking if wallet is connected:', error);
    }
  };

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        toast({
          title: "MetaMask not installed",
          description: "Please install MetaMask to connect your wallet",
          variant: "destructive"
        });
        return;
      }

      // Request accounts
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Initialize provider and get accounts
      const ethersProvider = await initializeProvider();
      if (ethersProvider) {
        await updateSignerAndAccounts(ethersProvider);
        
        const accounts = await ethersProvider.listAccounts();
        if (accounts.length > 0) {
          toast({
            title: "Wallet connected",
            description: `Connected to ${accounts[0].address.substring(0, 6)}...${accounts[0].address.substring(38)}`,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setSigner(null);
    toast({
      title: "Wallet disconnected",
    });
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        const ethersProvider = await initializeProvider();
        if (ethersProvider) {
          if (accounts.length > 0) {
            await updateSignerAndAccounts(ethersProvider);
          } else {
            setAccount(null);
            setSigner(null);
          }
        }
      });

      window.ethereum.on('chainChanged', async (chainId: string) => {
        setChainId(parseInt(chainId, 16));
        const ethersProvider = await initializeProvider();
        if (ethersProvider && account) {
          await updateSignerAndAccounts(ethersProvider);
        }
      });

      window.ethereum.on('disconnect', () => {
        setAccount(null);
        setChainId(null);
        setSigner(null);
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeAllListeners) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  const value = {
    account,
    chainId,
    connectWallet,
    disconnectWallet,
    isConnecting,
    isConnected: !!account,
    provider,
    signer
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
