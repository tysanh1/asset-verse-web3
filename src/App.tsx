
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Web3Provider } from "@/context/Web3Context";
import { AuthProvider } from "@/context/AuthContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Create from "./pages/Create";
import MyAssets from "./pages/MyAssets";
import AssetDetail from "./pages/AssetDetail";
import Transactions from "./pages/Transactions";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Web3Provider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create" element={<Create />} />
                <Route path="/my-assets" element={<MyAssets />} />
                <Route path="/asset/:id" element={<AssetDetail />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </Web3Provider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
