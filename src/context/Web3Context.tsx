
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ethers } from 'ethers';
import { NFT_CONTRACT_ADDRESS } from '@/contracts/NFTContract';
import { NetworkConfig } from '@/types/nft';

// Supported networks configuration
export const SUPPORTED_NETWORKS: Record<number, NetworkConfig> = {
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    isTestnet: false
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia',
    currency: 'SepoliaETH',
    rpcUrl: 'https://sepolia.infura.io/v3/',
    blockExplorer: 'https://sepolia.etherscan.io',
    isTestnet: true
  },
  // Add more networks as needed
};

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  isConnecting: boolean;
  isConnected: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  network: NetworkConfig | null;
  balance: string | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [network, setNetwork] = useState<NetworkConfig | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
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
        const chainIdValue = Number(network.chainId);
        setChainId(chainIdValue);
        
        // Set network information
        if (SUPPORTED_NETWORKS[chainIdValue]) {
          setNetwork(SUPPORTED_NETWORKS[chainIdValue]);
        } else {
          setNetwork({
            chainId: chainIdValue,
            name: network.name || 'Unknown Network',
            currency: 'ETH',
            rpcUrl: '',
            blockExplorer: '',
            isTestnet: false
          });
        }
        
        // Get and set user's balance
        const balance = await ethersProvider.getBalance(accounts[0].address);
        setBalance(ethers.formatEther(balance));
      } else {
        setSigner(null);
        setAccount(null);
        setBalance(null);
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
    setBalance(null);
    setNetwork(null);
    toast({
      title: "Wallet disconnected",
    });
  };

  // Add function to switch networks
  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not installed",
        description: "Please install MetaMask to switch networks",
        variant: "destructive"
      });
      return;
    }

    const hexChainId = '0x' + targetChainId.toString(16);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
      
      // Update provider information after network switch
      const ethersProvider = await initializeProvider();
      if (ethersProvider) {
        await updateSignerAndAccounts(ethersProvider);
      }
      
      toast({
        title: "Network switched",
        description: `Switched to ${SUPPORTED_NETWORKS[targetChainId]?.name || 'new network'}`,
      });
    } catch (error: any) {
      // This error code means the chain has not been added to MetaMask
      if (error.code === 4902) {
        // If we have network configuration, try to add it
        if (SUPPORTED_NETWORKS[targetChainId]) {
          const network = SUPPORTED_NETWORKS[targetChainId];
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: hexChainId,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.currency,
                    symbol: network.currency,
                    decimals: 18,
                  },
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.blockExplorer],
                },
              ],
            });
            
            // Try connecting to the newly added network
            const ethersProvider = await initializeProvider();
            if (ethersProvider) {
              await updateSignerAndAccounts(ethersProvider);
            }
            
            toast({
              title: "Network added",
              description: `Added and switched to ${network.name}`,
            });
          } catch (addError: any) {
            toast({
              title: "Failed to add network",
              description: addError.message || "Could not add network to MetaMask",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Network configuration missing",
            description: "Cannot add this network automatically",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Failed to switch network",
          description: error.message || "Could not switch networks",
          variant: "destructive"
        });
      }
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        const ethersProvider = await initializeProvider();
        if (ethersProvider) {
          if (accounts.length > 0) {
            await updateSignerAndAccounts(ethersProvider);
            toast({
              title: "Account changed",
              description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
            });
          } else {
            setAccount(null);
            setSigner(null);
            setBalance(null);
            toast({
              title: "Disconnected",
              description: "Wallet disconnected",
            });
          }
        }
      });

      window.ethereum.on('chainChanged', async (chainId: string) => {
        const newChainId = parseInt(chainId, 16);
        setChainId(newChainId);
        
        const ethersProvider = await initializeProvider();
        if (ethersProvider && account) {
          await updateSignerAndAccounts(ethersProvider);
          
          // Update network information
          if (SUPPORTED_NETWORKS[newChainId]) {
            setNetwork(SUPPORTED_NETWORKS[newChainId]);
            toast({
              title: "Network changed",
              description: `Switched to ${SUPPORTED_NETWORKS[newChainId].name}`,
            });
          } else {
            toast({
              title: "Network changed",
              description: `Switched to unknown network with chainId ${newChainId}`,
            });
          }
        }
      });

      window.ethereum.on('disconnect', () => {
        setAccount(null);
        setChainId(null);
        setSigner(null);
        setBalance(null);
        setNetwork(null);
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
    switchNetwork,
    isConnecting,
    isConnected: !!account,
    provider,
    signer,
    network,
    balance
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
