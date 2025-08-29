import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  sector: string | null;
  notes: string | null;
  added_at: string;
}

interface WatchlistTableProps {
  portfolioId: string;
  refreshTrigger: number;
}

export function WatchlistTable({ portfolioId, refreshTrigger }: WatchlistTableProps) {
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWatchlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .eq("portfolio_id", portfolioId)
        .order("added_at", { ascending: false });

      if (error) throw error;
      setWatchlistItems(data || []);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to load watchlist items.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (id: string, symbol: string) => {
    try {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Removed from watchlist",
        description: `${symbol} has been removed from your watchlist.`,
      });

      fetchWatchlist();
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove stock from watchlist.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [portfolioId, refreshTrigger]);

  if (loading) {
    return <div className="p-4 text-center">Loading watchlist...</div>;
  }

  if (watchlistItems.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Eye className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>No stocks in your watchlist yet.</p>
        <p className="text-sm">Add stocks you're interested in tracking.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Sector</TableHead>
            <TableHead>Added</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlistItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.symbol}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>
                {item.sector ? (
                  <Badge variant="outline">{item.sector}</Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {new Date(item.added_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {item.notes || (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromWatchlist(item.id, item.symbol)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}