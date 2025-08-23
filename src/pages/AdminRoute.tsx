import { useState, useEffect } from "react";
import { Admin } from "./Admin";
import { useProducts } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from "./Auth";
import { useNavigate } from "react-router-dom";

const AdminRoute = () => {
  const { products, createProduct, updateProduct, deleteProduct } = useProducts();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
        } else {
          // Redirect to auth if not logged in
          navigate("/auth");
        }
      } catch (error) {
        console.error("Error checking user:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onBack={() => navigate("/")} />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <Admin
        products={products}
        onAddProduct={createProduct}
        onUpdateProduct={updateProduct}
        onDeleteProduct={deleteProduct}
      />
    </div>
  );
};

export default AdminRoute;