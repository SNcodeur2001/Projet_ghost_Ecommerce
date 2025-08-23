import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  in_stock: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Erreur lors du chargement des produits");
        console.error("Error fetching products:", error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      toast.error("Erreur lors du chargement des produits");
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        toast.error("Erreur lors de la création du produit");
        console.error("Error creating product:", error);
        return null;
      }

      setProducts(prev => [data, ...prev]);
      toast.success("Produit créé avec succès");
      return data;
    } catch (error) {
      toast.error("Erreur lors de la création du produit");
      console.error("Error creating product:", error);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error("Erreur lors de la mise à jour du produit");
        console.error("Error updating product:", error);
        return null;
      }

      setProducts(prev => prev.map(p => p.id === id ? data : p));
      toast.success("Produit mis à jour avec succès");
      return data;
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du produit");
      console.error("Error updating product:", error);
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error("Erreur lors de la suppression du produit");
        console.error("Error deleting product:", error);
        return false;
      }

      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success("Produit supprimé avec succès");
      return true;
    } catch (error) {
      toast.error("Erreur lors de la suppression du produit");
      console.error("Error deleting product:", error);
      return false;
    }
  };

  const uploadProductImage = async (file: File) => {
    try {
      // Upload to Cloudinary using direct upload
      const uploadResult = await uploadToCloudinary(file, { folder: "products" });
      return uploadResult.secure_url;
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image");
      console.error("Error uploading image to Cloudinary:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage
  };
};