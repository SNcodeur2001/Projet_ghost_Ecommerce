import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Product } from "@/components/Products/ProductCard";

interface AdminProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, "id">) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const Admin = ({ products, onAddProduct, onUpdateProduct, onDeleteProduct }: AdminProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
    rating: "4.5",
    inStock: true,
  });

  const categories = ["Électronique", "Vêtements", "Maison", "Sport", "Beauté", "Livres"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
      rating: parseFloat(formData.rating),
      inStock: formData.inStock,
    };

    if (editingProduct) {
      onUpdateProduct({ ...editingProduct, ...productData });
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
    setIsEditing(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      rating: product.rating.toString(),
      inStock: product.inStock,
    });
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
                    <Label htmlFor="image">URL de l'image</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      required
                    />
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
                    <Button type="submit" className="flex-1 bg-gradient-primary">
                      {editingProduct ? "Modifier" : "Ajouter"}
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
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:shadow-card-hover transition-shadow"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {product.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">{product.category}</Badge>
                            <span className="text-sm font-medium">
                              {product.price.toLocaleString()} FCFA
                            </span>
                            {product.inStock ? (
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
                    ))
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