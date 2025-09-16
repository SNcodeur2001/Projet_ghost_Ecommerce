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
  collection: product.collection,
  sizes: product.sizes,
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
    collection: "",
    sizes: [] as string[],
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
      collection: formData.collection,
      sizes: formData.sizes,
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
      collection: "",
      sizes: [],
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
      collection: product.collection || "",
      sizes: product.sizes || [],
      rating: "4.5",
      inStock: product.in_stock ?? true,
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Administration</h1>
            <p className="text-muted-foreground mt-2">Gérer les produits de votre boutique</p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-primary hover:shadow-button rounded-full px-6 py-3 text-lg transition-all duration-500 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un produit
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire d'ajout/modification */}
          {isEditing && (
            <Card className="lg:col-span-1 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-elegant animate-fade-in">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">
                  {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2 animate-fade-in">
                    <Label htmlFor="name" className="text-base font-medium">Nom du produit</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <Label htmlFor="description" className="text-base font-medium">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      required
                      className="py-4 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary min-h-[120px]"
                    />
                  </div>

                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <Label htmlFor="price" className="text-base font-medium">Prix (FCFA)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      required
                      className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <Label htmlFor="image" className="text-base font-medium">Image du produit</Label>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="rounded-full border-2 hover:border-primary transition-all"
                        onClick={() => {
                          const fileInput = document.getElementById('image') as HTMLInputElement;
                          if (fileInput) fileInput.click();
                        }}
                      >
                        <Upload className="h-5 w-5" />
                      </Button>
                    </div>
                    {(imagePreview || formData.image) && (
                      <div className="mt-4 flex justify-center animate-fade-in">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="h-40 w-40 object-cover rounded-2xl border-2 border-border/50 shadow-elegant"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <Label htmlFor="category" className="text-base font-medium">Catégorie</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary">
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

                  <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.45s' }}>
                    <Label htmlFor="collection" className="text-base font-medium">Collection</Label>
                    <Input
                      id="collection"
                      value={formData.collection}
                      onChange={(e) => setFormData(prev => ({ ...prev, collection: e.target.value }))}
                      placeholder="Ex: Été 2024"
                      className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <Label className="text-base font-medium">Tailles disponibles</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <div key={size} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`size-${size}`}
                            checked={formData.sizes?.includes(size) || false}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                sizes: checked
                                  ? [...(prev.sizes || []), size]
                                  : (prev.sizes || []).filter(s => s !== size)
                              }));
                            }}
                            className="rounded border-border/50"
                          />
                          <Label htmlFor={`size-${size}`} className="text-sm font-normal">
                            {size}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 animate-fade-in" style={{ animationDelay: '0.55s' }}>
                    <Switch
                      id="inStock"
                      checked={formData.inStock}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: checked }))}
                      className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-border"
                    />
                    <Label htmlFor="inStock" className="text-base font-medium">En stock</Label>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-primary hover:shadow-button rounded-full py-6 text-lg transition-all duration-500 hover:scale-[1.02]"
                      disabled={isUploading}
                    >
                      {isUploading ? "Upload en cours..." : (editingProduct ? "Modifier" : "Ajouter")}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="rounded-full px-6 py-6 text-lg border-2 hover:border-primary transition-all">
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Liste des produits */}
          <div className={isEditing ? "lg:col-span-2" : "lg:col-span-3"} animate-fade-in>
            <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-elegant">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">Produits ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {products.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground animate-fade-in">
                      <div className="text-5xl mb-4">📦</div>
                      <p className="text-xl">Aucun produit ajouté pour le moment</p>
                      <p className="text-sm mt-2">Commencez par ajouter votre premier produit</p>
                    </div>
                  ) : (
                    products.map((product, index) => {
                      const uiProduct = convertToUIProduct(product);
                      return (
                        <div
                          key={uiProduct.id}
                          className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-6 bg-muted/30 rounded-2xl border border-border/50 hover:shadow-card-hover transition-all duration-300 animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <img
                            src={uiProduct.image}
                            alt={uiProduct.name}
                            className="h-20 w-20 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{uiProduct.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {uiProduct.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                              <Badge variant="secondary" className="rounded-full px-3 py-1">{uiProduct.category}</Badge>
                              {uiProduct.collection && (
                                <Badge variant="outline" className="rounded-full px-3 py-1 border-primary/50">
                                  {uiProduct.collection}
                                </Badge>
                              )}
                              <span className="text-base font-bold">
                                {uiProduct.price.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                              </span>
                              {uiProduct.inStock ? (
                                <Badge variant="default" className="bg-success rounded-full px-3 py-1">En stock</Badge>
                              ) : (
                                <Badge variant="destructive" className="rounded-full px-3 py-1">Rupture</Badge>
                              )}
                            </div>
                            {uiProduct.sizes && uiProduct.sizes.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {uiProduct.sizes.map((size) => (
                                  <Badge key={size} variant="outline" className="text-xs px-2 py-1">
                                    {size}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full border-2 hover:border-primary transition-all"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="rounded-full border-2 hover:border-destructive transition-all text-destructive hover:text-destructive"
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