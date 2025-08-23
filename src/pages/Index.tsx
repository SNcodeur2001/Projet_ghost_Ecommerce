import { useState, useEffect } from "react";
import { Navbar } from "@/components/Layout/Navbar";
import { ProductCard, Product as CardProduct } from "@/components/Products/ProductCard";
import { CartSheet, CartItem } from "@/components/Cart/CartSheet";
import { useProducts, Product } from "@/hooks/useProducts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { products, loading } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const convertToCardProduct = (product: Product): CardProduct => ({
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    image: product.image_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
    category: product.category || "Général",
    rating: 4.5,
    inStock: product.in_stock ?? true,
  });

  const addToCart = (product: CardProduct) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        toast.success(`${product.name} - Quantité mise à jour dans le panier`);
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      toast.success(`${product.name} ajouté au panier`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleCheckout = () => {
    // Save cart items to localStorage before navigating
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    navigate("/checkout");
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar
        cartItemsCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />

      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-foreground/10 flex items-center justify-center">
                <div className="text-4xl">👻</div>
              </div>
              <div className="absolute inset-0 rounded-full bg-foreground/5 animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Ghost Commerce
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Découvrez notre collection de produits premium avec une expérience d'achat exceptionnelle
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Nos Produits</h2>
            <p className="text-muted-foreground text-lg">
              Sélection premium de produits pour tous vos besoins
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Chargement des produits...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={convertToCardProduct(product)}
                  onAddToCart={addToCart}
                  isAdmin={false}
                />
              ))}
            </div>
          )}

          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Aucun produit disponible pour le moment
              </p>
            </div>
          )}
        </div>
      </section>

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={(id, quantity) => {
          if (quantity === 0) {
            setCartItems(prev => prev.filter(item => item.id !== id));
          } else {
            setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
          }
        }}
        onRemoveItem={(id) => setCartItems(prev => prev.filter(item => item.id !== id))}
      />
    </div>
  );
};

export default Index;