import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { Product as CardProduct } from "@/components/Products/ProductCard";
import { Product as UseProduct } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminProps {
  products: UseProduct[];
  onAddProduct: (product: Omit<UseProduct, "id" | "created_at" | "updated_at">) => void;
  onUpdateProduct: (id: string, updates: Partial<Omit<UseProduct, "id" | "created_at" | "updated_at">>) => void;
  onDeleteProduct: (id: string) => void;
}

// Convert database product to UI product for display
const convertToUIProduct = (product: UseProduct): CardProduct => ({
  id: product.id,
  name: product.name,
  description: product.description || "",
  price: product.price,
  image: product.image_url || "",
  category: product.category || "",
  rating: 4.5, // Default rating since it's not in the database
  inStock: product.in_stock ?? true,
});

export const Admin = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UseProduct | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    rating: "4.5",
    inStock: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const categories = ["Électronique", "Vêtements", "Maison", "Sport", "Beauté", "Livres"];

  // Handle image file selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      
      if (error) {
        toast.error("Erreur lors de l'upload de l'image");
        console.error("Error uploading image:", error);
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      return publicUrl;
    } catch (error) {
      toast.error("Erreur lors de l'upload de l'image");
      console.error("Error uploading image:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = formData.image;
    
    // If there's a new image file, upload it
    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      } else {
        // If upload failed, keep the existing image or use empty string
        imageUrl = editingProduct?.image_url || "";
      }
    }

    // Convert form data to database format
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image_url: imageUrl,
      category: formData.category,
      in_stock: formData.inStock,
    };

    if (editingProduct) {
      onUpdateProduct(editingProduct.id, productData);
    } else {
      onAddProduct(productData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      category: "",
      rating: "4.5",
      inStock: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: UseProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      image: product.image_url || "",
      category: product.category || "",
      rating: "4.5",
      inStock: product.in_stock ?? true,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Administration</h1>
            <p className="text-muted-foreground">Gérer les produits de votre boutique</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-primary hover:shadow-button transition-all duration-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire d'ajout/modification */}
          {isEditing && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>
                  {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nom du produit</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Prix (FCFA)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Image du produit</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          const fileInput = document.getElementById('image') as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                    {(imagePreview || formData.image) && (
                      <div className="mt-2">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                    />
                    <Label htmlFor="inStock">En stock</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-primary"
                      disabled={isUploading}
                    >
                      {isUploading ? "Upload en cours..." : (editingProduct ? "Modifier" : "Ajouter")}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Liste des produits */}
          <div className={isEditing ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card>
              <CardHeader>
                <CardTitle>Produits ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {products.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun produit ajouté pour le moment
                    </div>
                  ) : (
                    products.map((product) => {
                      const uiProduct = convertToUIProduct(product);
                      return (
                        <div
                          key={uiProduct.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-card-hover transition-shadow"
                        >
                          <img
                            src={uiProduct.image}
                            alt={uiProduct.name}
                            className="h-16 w-16 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{uiProduct.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {uiProduct.description}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">{uiProduct.category}</Badge>
                              <span className="text-sm font-medium">
                                {uiProduct.price.toLocaleString()} FCFA
                              </span>
                              {uiProduct.inStock ? (
                                <Badge variant="default" className="bg-success">En stock</Badge>
                              ) : (
                                <Badge variant="destructive">Rupture</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};