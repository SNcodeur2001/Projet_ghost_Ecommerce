import { ShoppingCart, User, Search, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  cartItems: number;
  onCartClick: () => void;
  isAdmin?: boolean;
  onAdminToggle?: () => void;
}

export const Navbar = ({ cartItems, onCartClick, isAdmin = false, onAdminToggle }: NavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              VendiCraft
            </span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Rechercher des produits..." 
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {onAdminToggle && (
              <Button
                variant={isAdmin ? "default" : "outline"}
                size="sm"
                onClick={onAdminToggle}
                className={isAdmin ? "bg-gradient-primary" : ""}
              >
                <User className="h-4 w-4 mr-2" />
                {isAdmin ? "Mode Client" : "Admin"}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItems > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-accent"
                >
                  {cartItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};