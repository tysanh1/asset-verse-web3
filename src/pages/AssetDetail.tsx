
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { nftService } from '@/services/nftService';
import { NFT, Transaction } from '@/types/nft';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/context/Web3Context';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Clock, Loader2, Copy, ExternalLink, Check } from 'lucide-react';

const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { account, isConnected } = useWeb3();
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNFT = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const nftData = await nftService.getNFTById(id);
        if (!nftData) {
          toast({
            title: "Asset not found",
            description: "The requested asset does not exist",
            variant: "destructive",
          });
          navigate('/my-assets');
          return;
        }
        setNft(nftData);
        
        // Fetch transaction history
        const txHistory = await nftService.getTransactionsByNFT(id);
        setTransactions(txHistory);
      } catch (error) {
        console.error('Error fetching NFT', error);
        toast({
          title: "Error",
          description: "Failed to load asset details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNFT();
  }, [id, navigate, toast]);

  const handleTransfer = async () => {
    if (!nft || !account || !isConnected) return;
    
    if (!recipientAddress || !recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid Ethereum address",
        variant: "destructive",
      });
      return;
    }
    
    if (recipientAddress.toLowerCase() === nft.owner.toLowerCase()) {
      toast({
        title: "Invalid recipient",
        description: "Cannot transfer to yourself",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsTransferring(true);
      const success = await nftService.transferNFT(account, recipientAddress, nft.id);
      
      if (success) {
        toast({
          title: "Asset transferred",
          description: "The asset has been transferred successfully",
        });
        
        // Update the NFT data
        const updatedNFT = await nftService.getNFTById(nft.id);
        setNft(updatedNFT);
        
        // Refresh transaction history
        const txHistory = await nftService.getTransactionsByNFT(nft.id);
        setTransactions(txHistory);
        
        setRecipientAddress('');
      } else {
        toast({
          title: "Transfer failed",
          description: "Failed to transfer the asset",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error transferring NFT', error);
      toast({
        title: "Error",
        description: "An error occurred during transfer",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const isOwner = nft && account && nft.owner.toLowerCase() === account.toLowerCase();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-web3-purple" />
      </div>
    );
  }

  if (!nft) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Asset Not Found</h1>
          <Button onClick={() => navigate('/my-assets')}>
            Back to My Assets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Image */}
        <div className="lg:col-span-1">
          <div className="nft-card">
            <div className="nft-card-inner p-0">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img 
                  src={nft.image} 
                  alt={nft.name} 
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Details */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-web3-purple/10 text-web3-purple">
              ID: {nft.id}
            </span>
          </div>
          
          <div className="prose dark:prose-invert max-w-none mb-6">
            <p>{nft.description}</p>
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Owner</span>
              <div className="flex items-center">
                <span className="font-mono">{formatAddress(nft.owner)}</span>
                <button 
                  onClick={() => handleCopyAddress(nft.owner)}
                  className="ml-2 text-gray-400 hover:text-web3-purple"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Creator</span>
              <div className="flex items-center">
                <span className="font-mono">{formatAddress(nft.creator)}</span>
              </div>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-500 dark:text-gray-400">Created</span>
              <span>{formatDate(nft.createdAt)}</span>
            </div>
          </div>
          
          {isOwner && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-web3-purple hover:bg-web3-deep-purple">
                  <Send className="mr-2 h-4 w-4" />
                  Transfer Asset
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Transfer Asset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Enter the recipient's Ethereum address to transfer this asset.
                    </p>
                  </div>
                  <Input
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                  />
                </div>
                <DialogFooter className="sm:justify-between">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    type="button" 
                    className="bg-web3-purple hover:bg-web3-deep-purple"
                    onClick={handleTransfer}
                    disabled={isTransferring}
                  >
                    {isTransferring ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Transferring...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Transfer
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Transaction History */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Transaction History
        </h2>
        
        <Card>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                No transaction history found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        From
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        To
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((tx, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <span className="font-mono text-xs">{tx.hash.substring(0, 10)}...</span>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-gray-400 hover:text-web3-purple"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.type === 'mint' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            }`}
                          >
                            {tx.type === 'mint' ? 'Mint' : 'Transfer'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {formatAddress(tx.from)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                          {formatAddress(tx.to)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(tx.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetDetail;
