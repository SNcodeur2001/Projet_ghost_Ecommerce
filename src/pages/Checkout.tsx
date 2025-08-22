import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CreditCard, Smartphone, Wallet } from "lucide-react";
import { CartItem } from "@/components/Cart/CartSheet";

interface CheckoutProps {
  items: CartItem[];
  onBack: () => void;
  onPayment: (method: string, customerInfo: any) => void;
}

export const Checkout = ({ items, onBack, onPayment }: CheckoutProps) => {
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const paymentMethods = [
    { id: "paydunya", name: "PayDunya", icon: CreditCard, description: "Cartes de crédit & Mobile Money" },
    { id: "wave", name: "Wave", icon: Smartphone, description: "Paiement mobile sécurisé" },
    { id: "orange-money", name: "Orange Money", icon: Wallet, description: "Mobile Money Orange" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    
    onPayment(selectedPayment, customerInfo);
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
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Mode de paiement</Label>
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPayment === method.id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="h-6 w-6 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">{method.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {method.description}
                            </div>
                          </div>
                          {selectedPayment === method.id && (
                            <Badge variant="default" className="bg-gradient-primary">
                              Sélectionné
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:shadow-button transition-all duration-300"
                  size="lg"
                  disabled={!selectedPayment}
                >
                  Payer {total.toLocaleString()} FCFA
                </Button>
              </form>
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