
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { nftService } from '@/services/nftService';
import { NFT } from '@/types/nft';
import NFTCard from '@/components/NFTCard';
import { supabase } from '@/integrations/supabase/client';

const Home = () => {
  const navigate = useNavigate();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const fetchedNfts = await nftService.getAllNFTs();
        setNfts(fetchedNfts);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Discover Digital Assets</h1>
        <Button onClick={() => navigate('/create')} className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
          Create Asset
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array(8).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden h-[360px] flex flex-col animate-pulse">
              <div className="h-48 bg-gray-300 dark:bg-gray-700"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))
        ) : nfts.length > 0 ? (
          nfts.map(nft => (
            <NFTCard key={nft.id} nft={nft} onClick={() => navigate(`/asset/${nft.id}`)} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <h3 className="text-xl font-semibold mb-4">No assets found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
              Start creating digital assets or connect your wallet to see your collections
            </p>
            <Button onClick={() => navigate('/create')} className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600">
              Create Your First Asset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
