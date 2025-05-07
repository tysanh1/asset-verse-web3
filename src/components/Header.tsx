
import React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3 } from '@/context/Web3Context';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

const Header: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnecting, isConnected } = useWeb3();

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
          
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-md text-sm">
                {account?.substring(0, 6)}...{account?.substring(38)}
              </span>
              <Button 
                variant="outline"
                size="sm" 
                onClick={disconnectWallet}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden md:inline">Disconnect</span>
              </Button>
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
    </header>
  );
};

export default Header;
