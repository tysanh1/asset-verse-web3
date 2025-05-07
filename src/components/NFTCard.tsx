
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NFT } from '@/types/nft';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

interface NFTCardProps {
  nft: NFT;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft }) => {
  return (
    <div className="nft-card">
      <div className="nft-card-inner">
        <CardHeader className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <img 
              src={nft.image} 
              alt={nft.name} 
              className="object-cover w-full h-full transform transition hover:scale-105"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-4 px-0">
          <h3 className="text-lg font-bold truncate">{nft.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10">
            {nft.description}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                ID: {nft.id}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-0 pt-2">
          <Link to={`/asset/${nft.id}`} className="w-full">
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </CardFooter>
      </div>
    </div>
  );
};

export default NFTCard;
