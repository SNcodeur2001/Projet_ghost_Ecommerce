import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Package, DollarSign, Image, Tag } from "lucide-react";
import { Product } from "@/hooks/useProducts";
import { toast } from "sonner";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (productData: any) => Promise<void>;
  onCancel: () => void;
  onImageUpload: (file: File) => Promise<string | null>;
}

export const ProductForm = ({ product, onSubmit, onCancel, onImageUpload }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || "",
    in_stock: product?.in_stock ?? true,
    image_url: product?.image_url || ""
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(product?.image_url || "");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error("Nom et prix sont obligatoires");
      return;
    }

    setLoading(true);
    
    try {
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        const uploadedUrl = await onImageUpload(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      await onSubmit({
        ...formData,
        image_url: imageUrl,
        price: Number(formData.price)
      });
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Package className="h-5 w-5" />
            {product ? "Modifier le produit" : "Nouveau produit"}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-foreground">Image du produit</Label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">Cliquez pour sélectionner une image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-border rounded-md cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Choisir une image
                  </label>
                </div>
              )}
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nom du produit *</Label>
              <div className="relative">
                <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10 border-border"
                  placeholder="Ex: Smartphone Premium"
                  required
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">Prix (FCFA) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="pl-10 border-border"
                  placeholder="150000"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">Catégorie</Label>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="pl-10 border-border"
                  placeholder="Ex: Électronique"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="border-border min-h-[100px]"
                placeholder="Description détaillée du produit..."
              />
            </div>

            {/* Stock Status */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div className="space-y-1">
                <Label className="text-foreground">Statut du stock</Label>
                <p className="text-sm text-muted-foreground">
                  Le produit est-il disponible en stock?
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant={formData.in_stock ? "default" : "destructive"}>
                  {formData.in_stock ? "En stock" : "Rupture"}
                </Badge>
                <Switch
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, in_stock: checked }))}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-border hover:bg-accent"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-foreground hover:bg-foreground/90 text-background"
              >
                {loading ? "Sauvegarde..." : (product ? "Mettre à jour" : "Créer le produit")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};