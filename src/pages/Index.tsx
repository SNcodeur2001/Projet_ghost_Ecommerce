import { useState, useEffect } from "react";
import { Navbar } from "@/components/Layout/Navbar";
import { ProductCard, Product as CardProduct } from "@/components/Products/ProductCard";
import { CartSheet, CartItem } from "@/components/Cart/CartSheet";
import { Checkout } from "./Checkout";
import { Admin } from "./Admin";
import { Auth } from "./Auth";
import { useProducts, Product } from "@/hooks/useProducts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct, uploadProductImage } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<"shop" | "checkout" | "admin" | "auth">("shop");
  const [user, setUser] = useState(null);

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

  // Format order details for WhatsApp message
  const formatOrderForWhatsApp = (items: CartItem[], customerInfo: any, total: number) => {
    let message = "🛍️ *Nouvelle commande passée sur Ghost Commerce*\n\n";
    
    message += "👤 *Informations client:*\n";
    message += `Nom: ${customerInfo.name}\n`;
    message += `Email: ${customerInfo.email}\n`;
    message += `Téléphone: ${customerInfo.phone}\n`;
    message += `Adresse: ${customerInfo.address}\n\n`;
    
    message += "📦 *Détails de la commande:*\n";
    items.forEach(item => {
      message += `\n• ${item.name}\n`;
      message += `  Quantité: ${item.quantity}\n`;
      message += `  Prix unitaire: ${item.price.toLocaleString()} FCFA\n`;
      message += `  Total: ${(item.price * item.quantity).toLocaleString()} FCFA\n`;
      message += `  Image: ${item.image}\n`;
    });
    
    message += `\n💰 *Total de la commande: ${total.toLocaleString()} FCFA*\n\n`;
    message += "Merci pour votre commande!";
    
    return encodeURIComponent(message);
  };

  const handlePayment = async (method: string, customerInfo: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('paydunya-payment', {
        body: {
          amount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          customerInfo,
          orderItems: cartItems,
          paymentMethod: method
        }
      });

      if (error) {
        toast.error("Erreur lors du traitement du paiement");
        return;
      }

      if (data.success) {
        toast.success("Commande confirmée! Redirection vers le paiement...");
        
        // Show notification about WhatsApp message
        toast.info("Détails de la commande envoyés par WhatsApp au propriétaire");
        
        // Send order details to owner via WhatsApp
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const whatsappMessage = formatOrderForWhatsApp(cartItems, customerInfo, total);
        const ownerNumber = import.meta.env.VITE_OWNER_WHATSAPP_NUMBER || "+1234567890";
        const whatsappUrl = `https://wa.me/${ownerNumber}?text=${whatsappMessage}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        
        setTimeout(() => {
          window.open(data.payment_url, '_blank');
          setCartItems([]);
          setCurrentPage("shop");
        }, 1500);
      } else {
        toast.error(data.error || "Erreur lors du paiement");
      }
    } catch (error) {
      toast.error("Erreur lors du traitement de la commande");
    }
  };

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (currentPage === "auth") {
    return <Auth onBack={() => setCurrentPage("shop")} />;
  }

  if (currentPage === "checkout") {
    return (
      <Checkout
        items={cartItems}
        onBack={() => setCurrentPage("shop")}
        onPayment={handlePayment}
      />
    );
  }

  if (currentPage === "admin" && user) {
    return (
      <>
        <Navbar
          cartItemsCount={totalCartItems}
          onCartClick={() => setIsCartOpen(true)}
          onAdminClick={() => setCurrentPage("shop")}
          onAuthClick={() => setCurrentPage("auth")}
        />
        <Admin
          products={products}
          onAddProduct={createProduct}
          onUpdateProduct={updateProduct}
          onDeleteProduct={deleteProduct}
          onImageUpload={uploadProductImage}
        />
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
          onCheckout={() => {
            setCurrentPage("checkout");
            setIsCartOpen(false);
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar
        cartItemsCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={() => {
          if (user) {
            setCurrentPage("admin");
          } else {
            setCurrentPage("auth");
          }
        }}
        onAuthClick={() => setCurrentPage("auth")}
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
        onCheckout={() => {
          setCurrentPage("checkout");
          setIsCartOpen(false);
        }}
      />
    </div>
  );
};

export default Index;