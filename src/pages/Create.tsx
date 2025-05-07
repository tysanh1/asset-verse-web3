
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/context/Web3Context';
import { NFTFormData } from '@/types/nft';
import { nftService } from '@/services/nftService';
import { ImagePlus, Loader2, X } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  image: z.any().refine((file) => file !== null, 'Image is required'),
});

const Create: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<NFTFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      image: null,
    },
  });

  const onSubmit = async (data: NFTFormData) => {
    if (!isConnected || !account) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await nftService.createNFT(data, account);
      
      toast({
        title: "Asset created",
        description: "Your digital asset has been created successfully!",
      });
      
      navigate('/my-assets');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create asset",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setValue('image', null);
    setImagePreview(null);
    const inputEl = document.getElementById('image-upload') as HTMLInputElement;
    if (inputEl) {
      inputEl.value = '';
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Connect Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Please connect your wallet to create a digital asset
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Digital Asset</h1>
        
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asset Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter asset name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your digital asset" 
                        className="resize-none h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {imagePreview ? (
                          <div className="relative">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="max-h-64 rounded-lg mx-auto"
                            />
                            <button
                              type="button"
                              onClick={clearImage}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                            <label htmlFor="image-upload" className="cursor-pointer">
                              <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                              <span className="mt-2 block text-sm font-medium text-gray-600 dark:text-gray-400">
                                Click to upload image
                              </span>
                            </label>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-web3-purple hover:bg-web3-deep-purple"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Digital Asset'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Create;
