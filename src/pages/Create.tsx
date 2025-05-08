
import React, { useState, useEffect } from 'react';
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
import { NFTFormData, NFTDraft } from '@/types/nft';
import { smartContractService } from '@/services/smartContractService';
import { ImagePlus, Loader2, X, Save, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  image: z.any().refine((file) => file !== null, 'Image is required'),
});

const AUTO_SAVE_DELAY = 2000; // 2 seconds

const Create: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { account, isConnected, connectWallet } = useWeb3();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string>(uuidv4());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  
  const form = useForm<NFTFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      image: null,
    },
  });

  // Load saved draft when component mounts
  useEffect(() => {
    loadDraft();
  }, []);

  // Setup auto-save when form values change
  useEffect(() => {
    const subscription = form.watch(() => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        saveFormAsDraft();
      }, AUTO_SAVE_DELAY);
      
      setAutoSaveTimer(timer);
    });
    
    return () => {
      subscription.unsubscribe();
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [form.watch, imagePreview]);

  const loadDraft = () => {
    try {
      const draftsJSON = localStorage.getItem('nft_drafts');
      if (draftsJSON) {
        const drafts: NFTDraft[] = JSON.parse(draftsJSON);
        if (drafts.length > 0) {
          const latestDraft = drafts[drafts.length - 1];
          
          form.setValue('name', latestDraft.name);
          form.setValue('description', latestDraft.description);
          
          if (latestDraft.image) {
            setImagePreview(latestDraft.image);
            // No need to set form.setValue('image') since we can't convert string back to File
            // We'll handle this during submission
          }
          
          setDraftId(latestDraft.id);
          toast({
            title: "Draft loaded",
            description: `Last saved on ${new Date(latestDraft.lastUpdated).toLocaleString()}`,
          });
        }
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  const saveFormAsDraft = () => {
    try {
      const formValues = form.getValues();
      const now = new Date();
      
      // Create draft object
      const draft: NFTDraft = {
        id: draftId,
        name: formValues.name,
        description: formValues.description,
        image: imagePreview,
        lastUpdated: now.toISOString(),
      };
      
      // Get existing drafts or initialize empty array
      const draftsJSON = localStorage.getItem('nft_drafts');
      let drafts: NFTDraft[] = draftsJSON ? JSON.parse(draftsJSON) : [];
      
      // Remove existing draft with same ID if exists
      drafts = drafts.filter(d => d.id !== draftId);
      
      // Add new draft
      drafts.push(draft);
      
      // Save back to localStorage
      localStorage.setItem('nft_drafts', JSON.stringify(drafts));
      
      setLastSaved(now);
      
      // Show toast only on manual save
      if (autoSaveTimer === null) {
        toast({
          title: "Draft saved",
          description: `Your draft has been saved at ${now.toLocaleString()}`,
        });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Could not save draft",
        variant: "destructive",
      });
    }
  };

  const deleteDraft = () => {
    try {
      // Get existing drafts
      const draftsJSON = localStorage.getItem('nft_drafts');
      if (draftsJSON) {
        let drafts: NFTDraft[] = JSON.parse(draftsJSON);
        
        // Remove draft with current ID
        drafts = drafts.filter(d => d.id !== draftId);
        
        // Save back to localStorage
        localStorage.setItem('nft_drafts', JSON.stringify(drafts));
      }
      
      // Reset form
      form.reset({
        name: '',
        description: '',
        image: null,
      });
      setImagePreview(null);
      setDraftId(uuidv4());
      
      toast({
        title: "Draft deleted",
        description: "Your draft has been deleted",
      });
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error",
        description: "Could not delete draft",
        variant: "destructive",
      });
    }
  };

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
      
      // Prepare image data for the smart contract service
      let imageData: string | File = data.image as File;
      
      // If we're using a draft image (which is already a string)
      if (!data.image && imagePreview) {
        imageData = imagePreview;
      } else if (data.image instanceof File) {
        // If it's a real File object from the file input
        const reader = new FileReader();
        imageData = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(data.image as File);
        });
      }
      
      // Call smart contract service to mint NFT
      await smartContractService.mintNFT(
        {
          name: data.name,
          description: data.description,
          image: imageData
        },
        account
      );
      
      // Delete the draft after successful submission
      deleteDraft();
      
      toast({
        title: "Asset created",
        description: "Your digital asset has been minted successfully!",
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Create Digital Asset</h1>
          <div className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center" 
              onClick={saveFormAsDraft}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center text-red-500 hover:text-red-600" 
              onClick={deleteDraft}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        {lastSaved && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Last auto-saved: {lastSaved.toLocaleString()}
          </p>
        )}
        
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
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Minting Asset...
                  </>
                ) : (
                  'Mint Digital Asset'
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
