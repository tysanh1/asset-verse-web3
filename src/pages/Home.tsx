
import React, { useState, useEffect } from 'react';
import NFTCard from '@/components/NFTCard';
import { nftService } from '@/services/nftService';
import { NFT } from '@/types/nft';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Wallet, ImagePlus } from 'lucide-react';
import { useWeb3 } from '@/context/Web3Context';

const Home: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const { isConnected, connectWallet } = useWeb3();

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const allNFTs = await nftService.getAllNFTs();
        setNfts(allNFTs);
      } catch (error) {
        console.error('Error fetching NFTs', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="hero-gradient">Discover, Create, and Trade Digital Assets</span>
            </h1>
            <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
              Securely manage your digital assets with blockchain technology. 
              Create, view, and transfer ownership with complete transparency.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
              {!isConnected ? (
                <Button onClick={connectWallet} size="lg" className="bg-web3-purple hover:bg-web3-deep-purple">
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </Button>
              ) : (
                <Link to="/create">
                  <Button size="lg" className="bg-web3-purple hover:bg-web3-deep-purple">
                    <ImagePlus className="mr-2 h-5 w-5" />
                    Create Asset
                  </Button>
                </Link>
              )}
              <Link to="/my-assets">
                <Button variant="outline" size="lg">
                  Explore Assets
                </Button>
              </Link>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
              <div className="absolute inset-0 bg-web3-gradient rounded-full opacity-20 blur-3xl"></div>
              <div className="relative z-10 animate-float">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWJzdHJhY3R8ZW58MHx8MHx8fDA%3D"
                  alt="Digital Asset"
                  className="rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Assets Section */}
      <section className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Featured Assets</h2>
          <Link to="/my-assets">
            <Button variant="link" className="text-web3-purple">
              View All
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse h-80"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nfts.map(nft => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="py-12 bg-gray-50 dark:bg-slate-800/20 rounded-xl my-12 px-6">
        <h2 className="text-2xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="bg-web3-purple/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <Wallet className="text-web3-purple w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">1. Connect Wallet</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Connect your MetaMask wallet securely to get started.
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="bg-web3-purple/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <ImagePlus className="text-web3-purple w-6 h-6" />
            </div>
            <h3 className="font-bold mb-2">2. Create Your Asset</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload details and mint your digital asset on the blockchain.
            </p>
          </div>
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <div className="bg-web3-purple/10 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
              <svg className="text-web3-purple w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 7L11.8845 5.76929C11.5634 5.41332 11.0557 5.37742 10.6907 5.68714L5 10.4142V19H19V10.4142L13.4142 4.82843C13.0391 4.45329 12.4643 4.47577 12.1213 4.87868L11 6.17157" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-bold mb-2">3. Manage Your Portfolio</h3>
            <p className="text-gray-600 dark:text-gray-300">
              View, transfer, and track the history of all your digital assets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
