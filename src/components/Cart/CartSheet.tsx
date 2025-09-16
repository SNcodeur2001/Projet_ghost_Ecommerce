import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, Send } from "lucide-react";
import { Product } from "../Products/ProductCard";
import { useNavigate } from "react-router-dom";

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export const CartSheet = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
}: CartSheetProps) => {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Save cart items to localStorage before navigating
    localStorage.setItem("cartItems", JSON.stringify(items));
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-background/90 backdrop-blur-xl border-l border-border/50 animate-fade-in">
        <SheetHeader className="border-b border-border/50 pb-4 animate-fade-in">
          <SheetTitle className="text-2xl font-bold">Panier d'achat</SheetTitle>
          <SheetDescription className="text-base">
            {items.length} article{items.length > 1 ? "s" : ""} dans votre
            panier
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground animate-fade-in">
                <div className="text-5xl mb-4">🛒</div>
                <p className="text-xl">Votre panier est vide</p>
                <p className="text-sm mt-2">
                  Ajoutez des produits pour commencer
                </p>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 bg-card/50 rounded-2xl border border-border/50 backdrop-blur-sm hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg line-clamp-1 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.price.toLocaleString()} FCFA
                    </p>
                    {item.selectedSize && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Taille: {item.selectedSize}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-2 hover:border-primary transition-all"
                        onClick={() =>
                          onUpdateQuantity(
                            item.id,
                            Math.max(0, item.quantity - 1)
                          )
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Badge
                        variant="secondary"
                        className="px-3 py-1 rounded-full text-base font-medium"
                      >
                        {item.quantity}
                      </Badge>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full border-2 hover:border-primary transition-all"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={() => onRemoveItem(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* {items.length > 0 && (
            <>
              <Separator className="bg-border/50 animate-fade-in" />
              <div className="py-6 space-y-6 animate-fade-in">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                    {total.toLocaleString()} <span className="text-base font-normal">FCFA</span>
                  </span>
                </div>
                <Button
                  className="w-full bg-gradient-primary hover:shadow-button rounded-full py-6 text-lg transition-all duration-500 hover:scale-[1.02]"
                  size="lg"
                  onClick={handleCheckout}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer la commande par WhatsApp
                </Button>
              </div>
            </>
          )} */}

          {items.length > 0 && (
            <>
              <Separator className="bg-border/50 animate-fade-in" />
              <div className="py-6 space-y-6 animate-fade-in sticky bottom-0 bg-background/90 backdrop-blur-xl">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-2xl bg-gradient-primary bg-clip-text text-transparent">
                    {total.toLocaleString()}{" "}
                    <span className="text-base font-normal">FCFA</span>
                  </span>
                </div>
                <Button
                  className="w-full bg-gradient-primary hover:shadow-button rounded-full py-6 text-lg transition-all duration-500 hover:scale-[1.02]"
                  size="lg"
                  onClick={handleCheckout}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer la commande par WhatsApp
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
