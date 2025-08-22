import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Ghost, Settings, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onAdminClick: () => void;
  onAuthClick: () => void;
}

export const Navbar = ({ cartItemsCount, onCartClick, onAdminClick, onAuthClick }: NavbarProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Ghost className="h-8 w-8 text-foreground" />
            <div className="absolute inset-0 animate-pulse">
              <Ghost className="h-8 w-8 text-muted-foreground opacity-50" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Ghost Commerce
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onAdminClick}
                className="hidden sm:inline-flex hover:bg-accent"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:inline-flex hover:bg-accent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onAuthClick}
              className="hidden sm:inline-flex hover:bg-accent"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onCartClick}
            className="relative hover:bg-accent border-border"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Panier
            {cartItemsCount > 0 && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-foreground text-background"
              >
                {cartItemsCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};