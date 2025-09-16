import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Layout/Navbar";
import { ProductCard, Product as CardProduct } from "@/components/Products/ProductCard";
import { CartSheet, CartItem } from "@/components/Cart/CartSheet";
import { useProducts, Product } from "@/hooks/useProducts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const Index = () => {
  const { products, loading } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Show 8 products per page
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

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter(product =>
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Pagination logic for desktop
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // For mobile: show all filtered products in carousel
  const mobileProducts = filteredProducts;

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const convertToCardProduct = (product: Product): CardProduct => ({
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    image: product.image_url || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400",
    category: product.category || "Général",
    collection: product.collection,
    sizes: product.sizes,
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
    <div className="min-h-screen bg-gradient-hero animate-fade-in">
      <Navbar
        cartItemsCount={totalCartItems}
        onCartClick={() => setIsCartOpen(true)}
      />

      <section className="relative py-24 md:py-32 px-4 text-center overflow-hidden animate-fade-in-down">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-foreground/5 flex items-center justify-center backdrop-blur-sm border border-foreground/10 animate-fade-in">
                <div className="text-5xl">👻</div>
              </div>
              <div className="absolute inset-0 rounded-full bg-foreground/5 animate-pulse-slow backdrop-blur-sm"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 tracking-tight animate-fade-in">
            Ghost <span className="bg-gradient-primary bg-clip-text text-transparent">Commerce</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Découvrez notre collection de produits premium avec une expérience d'achat exceptionnelle
          </p>
          <div className="flex justify-center gap-4 animate-fade-in">
            <Button
              size="lg"
              className="rounded-full bg-gradient-primary hover:shadow-button px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
              onClick={() => {
                const productsSection = document.getElementById('products-section');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Explorer nos produits
            </Button>
          </div>
        </div>
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-fade-in"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-fade-in"></div>
        </div>
      </section>

      <section className="py-20 px-4 bg-background animate-fade-in-up" id="products-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Nos Produits</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              Sélection premium de produits pour tous vos besoins
            </p>
          </div>

          {/* Search Input */}
          <div className="mb-8 max-w-md mx-auto animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-full border-2 focus:border-primary transition-all duration-300"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-muted-foreground text-xl">Chargement des produits...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-6xl mb-6">🔍</div>
              <p className="text-muted-foreground text-lg">
                {searchQuery ? "Aucun produit trouvé pour votre recherche" : "Aucun produit disponible pour le moment"}
              </p>
            </div>
          ) : (
            <>
              {/* Products Display */}
              <div className="mb-8">
                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {paginatedProducts.map((product, index) => (
                    <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <ProductCard
                        product={convertToCardProduct(product)}
                        onAddToCart={addToCart}
                        isAdmin={false}
                      />
                    </div>
                  ))}
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: false,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-4">
                      {mobileProducts.map((product, index) => (
                        <CarouselItem key={product.id} className="pl-4 basis-full">
                          <div className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                            <ProductCard
                              product={convertToCardProduct(product)}
                              onAddToCart={addToCart}
                              isAdmin={false}
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              </div>

              {/* Pagination - Only show on desktop */}
              {totalPages > 1 && (
                <div className="hidden md:flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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