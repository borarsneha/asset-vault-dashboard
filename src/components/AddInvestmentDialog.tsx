import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddInvestmentDialogProps {
  portfolioId: string | undefined;
  onInvestmentAdded: () => void;
}

export function AddInvestmentDialog({ portfolioId, onInvestmentAdded }: AddInvestmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!portfolioId) return;
    
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const symbol = formData.get('symbol') as string;
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const purchasePrice = parseFloat(formData.get('purchasePrice') as string);
    const quantity = parseFloat(formData.get('quantity') as string);
    const currentPrice = parseFloat(formData.get('currentPrice') as string);

    try {
      // Add investment
      const { data: investment, error: investmentError } = await supabase
        .from('investments')
        .insert({
          portfolio_id: portfolioId,
          symbol: symbol.toUpperCase(),
          name,
          type: type as 'stock' | 'bond' | 'mutual_fund' | 'etf' | 'crypto' | 'other',
          purchase_price: purchasePrice,
          quantity,
          current_price: currentPrice,
        })
        .select()
        .single();

      if (investmentError) throw investmentError;

      // Add transaction record
      const totalAmount = purchasePrice * quantity;
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          portfolio_id: portfolioId,
          investment_id: investment.id,
          symbol: symbol.toUpperCase(),
          name,
          type: 'buy' as 'buy' | 'sell',
          quantity,
          price: purchasePrice,
          total_amount: totalAmount,
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Investment Added',
        description: `Successfully added ${quantity} shares of ${symbol.toUpperCase()}`,
      });

      setOpen(false);
      onInvestmentAdded();
      e.currentTarget.reset();
    } catch (error: any) {
      console.error('Error adding investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add investment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                name="symbol"
                placeholder="AAPL"
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Company Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Apple Inc."
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Investment Type</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stock">Stock</SelectItem>
                <SelectItem value="bond">Bond</SelectItem>
                <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                <SelectItem value="etf">ETF</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="0.0001"
                min="0"
                placeholder="100"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                name="purchasePrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="150.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentPrice">Current Price</Label>
            <Input
              id="currentPrice"
              name="currentPrice"
              type="number"
              step="0.01"
              min="0"
              placeholder="155.00"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Investment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}