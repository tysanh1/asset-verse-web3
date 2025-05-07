
import React, { useState, useEffect } from 'react';
import { nftService } from '@/services/nftService';
import { Transaction } from '@/types/nft';
import { useWeb3 } from '@/context/Web3Context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Clock, ExternalLink, Loader2 } from 'lucide-react';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { account, isConnected, connectWallet } = useWeb3();

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!account) return;
      
      try {
        setLoading(true);
        const userTxs = await nftService.getTransactionsByUser(account);
        setTransactions(userTxs);
      } catch (error) {
        console.error('Error fetching transactions', error);
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      fetchTransactions();
    } else {
      setLoading(false);
    }
  }, [account]);

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

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Please connect your wallet to view your transaction history
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
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Clock className="mr-3 h-6 w-6" />
        Transaction History
      </h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-web3-purple" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800/20 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No transactions found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't made any transactions yet.
          </p>
          <Link to="/create">
            <Button className="bg-web3-purple hover:bg-web3-deep-purple">
              Create Your First Asset
            </Button>
          </Link>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
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
                      Asset ID
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Action
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/asset/${tx.tokenId}`}
                          className="text-web3-purple hover:underline"
                        >
                          #{tx.tokenId}
                        </Link>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <Link to={`/asset/${tx.tokenId}`}>
                          <Button size="sm" variant="outline">
                            View Asset
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Transactions;
