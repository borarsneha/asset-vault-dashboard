import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Investment {
  id: string
  symbol: string
  name: string
  type: string
  purchase_price: number
  quantity: number
  current_price: number
}

interface RecommendedStock {
  symbol: string
  name: string
  sector: string
  price: number
  change: number
  reason: string
}

interface RecommendedStocksProps {
  investments: Investment[]
  portfolioId?: string
  onAddInvestment?: () => void
}

export function RecommendedStocks({ investments, portfolioId, onAddInvestment }: RecommendedStocksProps) {
  const { toast } = useToast()

  // Generate recommendations based on current investments
  const generateRecommendations = (): RecommendedStock[] => {
    const sectors = investments.map(inv => inv.type).filter((type, index, arr) => arr.indexOf(type) === index)
    
    // Mock recommendations - in a real app, this would come from an API
    const recommendations: RecommendedStock[] = [
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        sector: 'Technology',
        price: 378.85,
        change: 2.1,
        reason: 'Similar to your tech holdings'
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        sector: 'Technology',
        price: 875.32,
        change: 3.8,
        reason: 'High growth potential in AI sector'
      },
      {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        sector: 'Financial',
        price: 215.67,
        change: 1.2,
        reason: 'Diversification into financial sector'
      },
      {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        sector: 'Healthcare',
        price: 156.78,
        change: 0.8,
        reason: 'Stable dividend stock for portfolio balance'
      },
      {
        symbol: 'TSLA',
        name: 'Tesla, Inc.',
        sector: 'Automotive',
        price: 248.42,
        change: -1.5,
        reason: 'Innovation leader in electric vehicles'
      }
    ]

    // Filter out stocks user already owns
    const ownedSymbols = investments.map(inv => inv.symbol.toUpperCase())
    return recommendations.filter(rec => !ownedSymbols.includes(rec.symbol))
  }

  const recommendedStocks = generateRecommendations()

  const handleAddToWatchlist = (stock: RecommendedStock) => {
    toast({
      title: 'Added to Watchlist',
      description: `${stock.symbol} has been added to your watchlist`,
    })
  }

  if (investments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommended Stocks
          </CardTitle>
          <CardDescription>
            Add some investments to see personalized recommendations
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommended for You
        </CardTitle>
        <CardDescription>
          Based on your current portfolio and market trends
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedStocks.slice(0, 4).map((stock) => (
            <div key={stock.symbol} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{stock.symbol}</h4>
                  <p className="text-sm text-muted-foreground">{stock.name}</p>
                </div>
                <Badge variant="secondary">{stock.sector}</Badge>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-lg font-bold">${stock.price.toFixed(2)}</span>
                <span className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">{stock.reason}</p>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleAddToWatchlist(stock)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add to Watchlist
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}