import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send } from "lucide-react";
import { CartItem } from "@/components/Cart/CartSheet";

interface CheckoutProps {
  items: CartItem[];
  onBack: () => void;
}

// Format order details for WhatsApp message with image display
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
    // Add image as a clickable link
    message += `  Image: ${item.image}\n`;
  });
  
  message += `\n💰 *Total de la commande: ${total.toLocaleString()} FCFA*\n\n`;
  message += "Merci pour votre commande!";
  
  return encodeURIComponent(message);
};

export const Checkout = ({ items, onBack }: CheckoutProps) => {
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleWhatsAppSend = () => {
    const whatsappMessage = formatOrderForWhatsApp(items, customerInfo, total);
    const ownerNumber = import.meta.env.VITE_OWNER_WHATSAPP_NUMBER || "+221781562041";
    const whatsappUrl = `https://wa.me/${ownerNumber}?text=${whatsappMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Informations de livraison */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <Separator className="my-6" />

                <Button
                  onClick={handleWhatsAppSend}
                  className="w-full bg-gradient-primary hover:shadow-button transition-all duration-300"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Envoyer la commande par WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Récapitulatif de commande */}
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Quantité: {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">
                      {(item.price * item.quantity).toLocaleString()} FCFA
                    </div>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {total.toLocaleString()} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};