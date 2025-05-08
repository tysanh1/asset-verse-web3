import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3 } from '@/context/Web3Context';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  LogOut, 
  User, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  Check,
  CircleDollarSign
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SUPPORTED_NETWORKS } from '@/context/Web3Context';
import { useToast } from '@/hooks/use-toast';

const Header: React.FC = () => {
  const { 
    account, 
    connectWallet, 
    disconnectWallet, 
    isConnecting, 
    isConnected,
    chainId,
    balance,
    switchNetwork,
    network
  } = useWeb3();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openBlockExplorer = () => {
    if (account && network) {
      const explorerUrl = `${network.blockExplorer}/address/${account}`;
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm px-4 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold">
          <span className="hero-gradient">AssetVerse</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 dark:text-gray-200 hover:text-web3-purple transition-colors">
              Home
            </Link>
            <Link to="/create" className="text-gray-700 dark:text-gray-200 hover:text-web3-purple transition-colors">
              Create
            </Link>
            <Link to="/my-assets" className="text-gray-700 dark:text-gray-200 hover:text-web3-purple transition-colors">
              My Assets
            </Link>
            <Link to="/transactions" className="text-gray-700 dark:text-gray-200 hover:text-web3-purple transition-colors">
              Transactions
            </Link>
          </nav>
          
          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            ) : (
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => navigate('/auth')}
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Sign In</span>
              </Button>
            )}
            
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Network indicator */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${network?.isTestnet ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                      <span className="hidden md:inline max-w-[100px] truncate">{network?.name || 'Unknown'}</span>
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.values(SUPPORTED_NETWORKS).map(network => (
                      <DropdownMenuItem 
                        key={network.chainId} 
                        onClick={() => switchNetwork(network.chainId)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${network.isTestnet ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
                          {network.name}
                          {network.chainId === chainId && <Check className="ml-2 h-4 w-4 text-green-500" />}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Wallet dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CircleDollarSign className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="hidden md:inline">
                        {account?.substring(0, 6)}...{account?.substring(38)}
                      </span>
                      <span className="md:hidden">
                        {account?.substring(0, 4)}...
                      </span>
                      <ChevronDown size={14} className="ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Wallet</DropdownMenuLabel>
                    {balance && (
                      <div className="px-2 py-1 text-sm">
                        <span className="font-medium">{parseFloat(balance).toFixed(4)} {network?.currency || 'ETH'}</span>
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={copyAddress}>
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? "Copied!" : "Copy Address"}
                    </DropdownMenuItem>
                    {network?.blockExplorer && (
                      <DropdownMenuItem className="cursor-pointer" onClick={openBlockExplorer}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View on Explorer
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={disconnectWallet}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-web3-purple hover:bg-web3-deep-purple"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
