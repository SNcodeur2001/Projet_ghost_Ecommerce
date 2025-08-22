import { useState } from "react";
import { Navbar } from "@/components/Layout/Navbar";
import { ProductCard, Product } from "@/components/Products/ProductCard";
import { CartSheet, CartItem } from "@/components/Cart/CartSheet";
import { Checkout } from "./Checkout";
import { Admin } from "./Admin";
import { useToast } from "@/hooks/use-toast";

// Données de démonstration
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone Premium",
    description: "Dernier modèle avec écran OLED et caméra 108MP",
    price: 250000,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    category: "Électronique",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "2",
    name: "Sac à Main Élégant",
    description: "Sac en cuir véritable, parfait pour toutes occasions",
    price: 45000,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400",
    category: "Vêtements",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "3",
    name: "Écouteurs Sans Fil",
    description: "Audio haute qualité avec réduction de bruit active",
    price: 85000,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    category: "Électronique",
    rating: 4.7,
    inStock: false,
  },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"shop" | "checkout" | "admin">("shop");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        toast({
          title: "Produit ajouté",
          description: `${product.name} - Quantité mise à jour dans le panier`,
        });
        return prev.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      toast({
        title: "Produit ajouté",
        description: `${product.name} ajouté au panier`,
      });
      
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Produit retiré",
      description: "Le produit a été retiré de votre panier",
    });
  };

  const handleCheckout = () => {
    setCurrentPage("checkout");
    setIsCartOpen(false);
  };

  const handlePayment = (method: string, customerInfo: any) => {
    toast({
      title: "Commande confirmée!",
      description: `Votre commande sera traitée via ${method}. Merci pour votre achat!`,
    });
    
    // Simuler le traitement du paiement
    setTimeout(() => {
      setCartItems([]);
      setCurrentPage("shop");
    }, 2000);
  };

  const addProduct = (productData: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
    };
    setProducts(prev => [...prev, newProduct]);
    toast({
      title: "Produit ajouté",
      description: `${productData.name} a été ajouté au catalogue`,
    });
  };

  const updateProduct = (product: Product) => {
    setProducts(prev =>
      prev.map(p => p.id === product.id ? product : p)
    );
    toast({
      title: "Produit modifié",
      description: `${product.name} a été mis à jour`,
    });
  };

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Produit supprimé",
      description: `${product?.name} a été supprimé du catalogue`,
    });
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (currentPage === "checkout") {
    return (
      <Checkout
        items={cartItems}
        onBack={() => setCurrentPage("shop")}
        onPayment={handlePayment}
      />
    );
  }

  if (currentPage === "admin" || isAdminMode) {
    return (
      <>
        <Navbar
          cartItems={totalCartItems}
          onCartClick={() => setIsCartOpen(true)}
          isAdmin={true}
          onAdminToggle={() => {
            setIsAdminMode(false);
            setCurrentPage("shop");
          }}
        />
        <Admin
          products={products}
          onAddProduct={addProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
        />
        <CartSheet
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        cartItems={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        isAdmin={false}
        onAdminToggle={() => setIsAdminMode(true)}
      />

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-hero">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Bienvenue chez VendiCraft
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Découvrez notre collection de produits premium avec une expérience d'achat exceptionnelle
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos Produits</h2>
            <p className="text-muted-foreground text-lg">
              Sélection premium de produits pour tous vos besoins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                isAdmin={false}
              />
            ))}
          </div>

          {products.length === 0 && (
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
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
};

export default Index;