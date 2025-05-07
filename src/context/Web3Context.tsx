
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) return;

      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length) {
        setAccount(accounts[0]);
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setChainId(parseInt(chainId, 16));
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

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainId, 16));
      toast({
        title: "Wallet connected",
        description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });
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
    toast({
      title: "Wallet disconnected",
    });
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      });

      window.ethereum.on('disconnect', () => {
        setAccount(null);
        setChainId(null);
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
    isConnected: !!account
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
