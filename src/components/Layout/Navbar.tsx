import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Ghost, Settings, LogIn, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  cartItemsCount: number;
  onCartClick: () => void;
}

export const Navbar = ({ cartItemsCount, onCartClick }: NavbarProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

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

  const handleAdminClick = () => {
    if (user) {
      navigate("/admin");
    } else {
      navigate("/auth");
    }
  };

  const handleAuthClick = () => {
    navigate("/auth");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => window.location.href = '/'}
        >
          <div className="relative">
            <Ghost className="h-8 w-8 text-foreground transition-transform group-hover:scale-110" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Ghost Commerce
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAdminClick}
                className="hidden sm:inline-flex hover:bg-accent rounded-full px-4 transition-all duration-300"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hidden sm:inline-flex hover:bg-accent rounded-full px-4 transition-all duration-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAuthClick}
              className="hidden sm:inline-flex hover:bg-accent rounded-full px-4 transition-all duration-300"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Connexion
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCartClick}
            className="relative hover:bg-accent border-border rounded-full px-4 transition-all duration-300 group"
          >
            <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Panier</span>
            {cartItemsCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-foreground text-background rounded-full transition-all duration-300 hover:scale-110"
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