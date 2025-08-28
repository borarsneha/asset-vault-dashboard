import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  type: string;
  purchase_price: number;
  quantity: number;
  current_price: number;
}

interface InvestmentsListProps {
  investments: Investment[];
  onInvestmentUpdated: () => void;
  onInvestmentDeleted: () => void;
}

export function InvestmentsList({ investments, onInvestmentUpdated, onInvestmentDeleted }: InvestmentsListProps) {
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      stock: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
      bond: 'bg-green-500/10 text-green-700 dark:text-green-300',
      mutual_fund: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
      etf: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
      crypto: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
      other: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
    };
    return colors[type] || colors.other;
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingInvestment) return;
    
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const currentPrice = parseFloat(formData.get('currentPrice') as string);
    const quantity = parseFloat(formData.get('quantity') as string);

    try {
      const { error } = await supabase
        .from('investments')
        .update({
          current_price: currentPrice,
          quantity,
        })
        .eq('id', editingInvestment.id);

      if (error) throw error;

      toast({
        title: 'Investment Updated',
        description: `Updated ${editingInvestment.symbol} successfully`,
      });

      setEditingInvestment(null);
      onInvestmentUpdated();
    } catch (error: any) {
      console.error('Error updating investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update investment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (investment: Investment) => {
    if (!confirm(`Are you sure you want to delete ${investment.symbol}?`)) return;
    
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', investment.id);

      if (error) throw error;

      toast({
        title: 'Investment Deleted',
        description: `Removed ${investment.symbol} from portfolio`,
      });

      onInvestmentDeleted();
    } catch (error: any) {
      console.error('Error deleting investment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete investment',
        variant: 'destructive',
      });
    }
  };

  if (investments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No investments yet</p>
            <p className="text-sm text-muted-foreground">Add your first investment to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {investments.map((investment) => {
        const currentValue = investment.current_price * investment.quantity;
        const costBasis = investment.purchase_price * investment.quantity;
        const gainLoss = currentValue - costBasis;
        const gainLossPercentage = (gainLoss / costBasis) * 100;
        const isPositive = gainLoss >= 0;

        return (
          <Card key={investment.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <CardTitle className="text-lg">{investment.symbol}</CardTitle>
                    <p className="text-sm text-muted-foreground">{investment.name}</p>
                  </div>
                  <Badge className={getTypeColor(investment.type)}>
                    {investment.type.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingInvestment(investment)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(investment)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Quantity</p>
                  <p className="font-medium">{investment.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purchase Price</p>
                  <p className="font-medium">${investment.purchase_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Price</p>
                  <p className="font-medium">${investment.current_price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Value</p>
                  <p className="font-medium">${currentValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gain/Loss</p>
                  <div className="flex items-center space-x-1">
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <div className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <div>${gainLoss.toFixed(2)}</div>
                      <div className="text-xs">({gainLossPercentage.toFixed(2)}%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={!!editingInvestment} onOpenChange={() => setEditingInvestment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Investment - {editingInvestment?.symbol}</DialogTitle>
          </DialogHeader>
          {editingInvestment && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  name="quantity"
                  type="number"
                  step="0.0001"
                  defaultValue={editingInvestment.quantity}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-currentPrice">Current Price</Label>
                <Input
                  id="edit-currentPrice"
                  name="currentPrice"
                  type="number"
                  step="0.01"
                  defaultValue={editingInvestment.current_price}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Updating...' : 'Update Investment'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}