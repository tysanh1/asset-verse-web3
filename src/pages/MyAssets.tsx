
import React, { useState, useEffect } from 'react';
import NFTCard from '@/components/NFTCard';
import { smartContractService } from '@/services/smartContractService';
import { NFT } from '@/types/nft';
import { useWeb3 } from '@/context/Web3Context';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ImagePlus, Loader2 } from 'lucide-react';

const MyAssets: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { account, isConnected, connectWallet } = useWeb3();

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!account) return;
      
      try {
        setLoading(true);
        const ownedNFTs = await smartContractService.getNFTsByOwner(account);
        setNfts(ownedNFTs);
      } catch (error) {
        console.error('Error fetching NFTs', error);
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      fetchNFTs();
    } else {
      setLoading(false);
    }
  }, [account]);

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Please connect your wallet to view your digital assets
          </p>
          <Button 
            onClick={connectWallet} 
            className="w-full bg-web3-purple hover:bg-web3-deep-purple"
          >
            Connect Wallet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Digital Assets</h1>
        <Link to="/create">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
            <ImagePlus className="mr-2 h-5 w-5" />
            Mint New NFT
          </Button>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-web3-purple" />
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/20 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No assets found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have any digital assets yet.
          </p>
          <Link to="/create">
            <Button className="bg-web3-purple hover:bg-web3-deep-purple">
              <ImagePlus className="mr-2 h-5 w-5" />
              Create Your First Asset
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {nfts.map(nft => (
            <NFTCard key={nft.id} nft={nft} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAssets;
