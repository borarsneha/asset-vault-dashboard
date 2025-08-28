import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Portfolio Manager
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          Track your investments, monitor performance, and manage your financial portfolio with ease
        </p>
        <div className="space-y-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href="/auth">Get Started</a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Professional portfolio management made simple
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
