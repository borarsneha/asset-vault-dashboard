import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

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

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Your investment transactions will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your investment transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {transaction.type === 'buy' ? (
                    <ArrowUpCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowDownCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-sm truncate">
                      {transaction.symbol}
                    </p>
                    <Badge 
                      variant={transaction.type === 'buy' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.type.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {transaction.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.transaction_date)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end space-y-1">
                <div className="text-right">
                  <p className="font-medium text-sm">
                    {transaction.quantity} @ ${transaction.price.toFixed(2)}
                  </p>
                  <p className={`text-sm font-medium ${
                    transaction.type === 'buy' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {transaction.type === 'buy' ? '-' : '+'}${transaction.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}