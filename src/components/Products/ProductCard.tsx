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
    <Card className="group cursor-pointer transition-all duration-500 hover:shadow-elegant hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {!product.inStock && (
          <Badge variant="destructive" className="absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-medium">
            Rupture de stock
          </Badge>
        )}
        <Badge variant="secondary" className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
          {product.category}
        </Badge>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-bold text-xl line-clamp-1 tracking-tight">{product.name}</h3>
          <div className="flex items-center bg-muted/80 rounded-full px-2 py-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {product.price.toLocaleString()} <span className="text-base font-normal">FCFA</span>
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="px-5 pb-5 pt-0">
        {isAdmin ? (
          <Button
            variant="outline"
            className="w-full rounded-full border-2 hover:border-primary transition-all duration-300"
            onClick={() => onEdit?.(product)}
          >
            Modifier
          </Button>
        ) : (
          <Button
            className="w-full bg-gradient-primary hover:shadow-button rounded-full transition-all duration-500 hover:scale-[1.02] group"
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
          >
            <ShoppingCart className="h-4 w-4 mr-2 group-hover:animate-bounce" />
            {product.inStock ? "Ajouter au panier" : "Indisponible"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};