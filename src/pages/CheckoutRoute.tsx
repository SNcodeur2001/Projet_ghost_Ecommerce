import { useState, useEffect } from "react";
import { Checkout } from "./Checkout";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";

const CheckoutRoute = () => {
  const [cartItems, setCartItems] = useState([]);
  const { products } = useProducts();

  useEffect(() => {
    // Load cart items from localStorage or session storage
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart items", e);
        setCartItems([]);
      }
    }
  }, []);

  return (
    <Checkout 
      items={cartItems} 
      onBack={() => window.history.back()} 
    />
  );
};

export default CheckoutRoute;