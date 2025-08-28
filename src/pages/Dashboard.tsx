import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { AddInvestmentDialog } from '@/components/AddInvestmentDialog';
import { TransactionHistory } from '@/components/TransactionHistory';
import { InvestmentsList } from '@/components/InvestmentsList';

interface Portfolio {
  id: string;
  name: string;
  description: string;
}

interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: string;
  purchase_price: number;
  quantity: number;
  current_price: number;
}

interface Transaction {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string;
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user's portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (portfolioError && portfolioError.code !== 'PGRST116') {
        throw portfolioError;
      }

      setPortfolio(portfolioData);

      if (portfolioData) {
        // Fetch investments
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select('*')
          .eq('portfolio_id', portfolioData.id);

        if (investmentsError) throw investmentsError;
        setInvestments(investmentsData || []);

        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('portfolio_id', portfolioData.id)
          .order('transaction_date', { ascending: false });

        if (transactionsError) throw transactionsError;
        setTransactions(transactionsData || []);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch portfolio data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  };

  const calculatePortfolioMetrics = () => {
    const totalValue = investments.reduce((sum, inv) => sum + (inv.current_price * inv.quantity), 0);
    const totalCost = investments.reduce((sum, inv) => sum + (inv.purchase_price * inv.quantity), 0);
    const totalGainLoss = totalValue - totalCost;
    const gainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    return { totalValue, totalCost, totalGainLoss, gainLossPercentage };
  };

  const { totalValue, totalCost, totalGainLoss, gainLossPercentage } = calculatePortfolioMetrics();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Portfolio Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gain/Loss</CardTitle>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalGainLoss.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              {gainLossPercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${gainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {gainLossPercentage.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="investments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="investments">Investments</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="investments" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Investments</h2>
              <AddInvestmentDialog portfolioId={portfolio?.id} onInvestmentAdded={fetchData} />
            </div>
            <InvestmentsList 
              investments={investments} 
              onInvestmentUpdated={fetchData}
              onInvestmentDeleted={fetchData}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Transaction History</h2>
            </div>
            <TransactionHistory transactions={transactions} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;