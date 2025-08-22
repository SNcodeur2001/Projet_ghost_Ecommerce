import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
}

export const ProductCard = ({ product, onAddToCart, isAdmin = false, onEdit }: ProductCardProps) => {
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-product hover:-translate-y-1 border-0 bg-card/50">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.image}
          alt={product.name}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!product.inStock && (
          <Badge variant="destructive" className="absolute top-2 left-2">
            Rupture de stock
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-2 right-2 bg-background/90">
          {product.category}
        </Badge>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm text-muted-foreground">{product.rating}</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {product.price.toLocaleString()} FCFA
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        {isAdmin ? (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => onEdit?.(product)}
          >
            Modifier
          </Button>
        ) : (
          <Button
            className="w-full bg-gradient-primary hover:shadow-button transition-all duration-300"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.inStock ? "Ajouter au panier" : "Indisponible"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};