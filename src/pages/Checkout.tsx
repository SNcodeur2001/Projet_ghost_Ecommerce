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
    if (item.selectedSize) {
      message += `  Taille: ${item.selectedSize}\n`;
    }
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
    <div className="min-h-screen bg-gradient-hero p-4 md:p-8 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={onBack} className="mb-8 hover:bg-accent/50 rounded-full px-6 py-2 animate-fade-in">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour au panier
        </Button>

        <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Informations de livraison */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-elegant animate-fade-in">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold">Informations de livraison</CardTitle>
              <p className="text-muted-foreground">Veuillez fournir vos informations de livraison</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="name" className="text-base font-medium">Nom complet</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  <Label htmlFor="email" className="text-base font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <Label htmlFor="phone" className="text-base font-medium">Téléphone</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <Label htmlFor="address" className="text-base font-medium">Adresse</Label>
                  <Input
                    id="address"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    required
                    className="py-6 px-4 rounded-xl border-border/50 focus:border-primary focus:ring-primary"
                  />
                </div>

                <Separator className="my-6 bg-border/50 animate-fade-in" style={{ animationDelay: '0.4s' }} />
                
                <Button
                  onClick={handleWhatsAppSend}
                  className="w-full bg-gradient-primary hover:shadow-button rounded-full py-6 text-lg transition-all duration-500 hover:scale-[1.02] animate-fade-in"
                  size="lg"
                  style={{ animationDelay: '0.5s' }}
                >
                  <Send className="h-5 w-5 mr-2" />
                  Envoyer la commande par WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Récapitulatif de commande */}
          <Card className="bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl shadow-elegant animate-fade-in">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold">Récapitulatif de commande</CardTitle>
              <p className="text-muted-foreground">{items.length} article{items.length > 1 ? 's' : ''} dans votre commande</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="max-h-96 overflow-y-auto pr-2">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-4 py-4 border-b border-border/50 last:border-0 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-lg">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Quantité: {item.quantity}
                        </div>
                        {item.selectedSize && (
                          <div className="text-sm text-muted-foreground">
                            Taille: {item.selectedSize}
                          </div>
                        )}
                      </div>
                      <div className="font-bold text-lg">
                        {(item.price * item.quantity).toLocaleString()} <span className="text-base font-normal">FCFA</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="bg-border/50 animate-fade-in" />
                
                <div className="space-y-4 animate-fade-in">
                  <div className="flex justify-between text-lg">
                    <span>Sous-total</span>
                    <span className="font-medium">{total.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span>Livraison</span>
                    <span className="text-green-600 font-medium">Partout dans le monde</span>
                  </div>
                  <Separator className="bg-border/50" />
                  <div className="flex justify-between text-2xl font-bold pt-2">
                    <span>Total</span>
                    <span className="bg-gradient-primary bg-clip-text text-transparent">
                      {total.toLocaleString()} <span className="text-xl font-normal">FCFA</span>
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