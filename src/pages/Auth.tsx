import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Ghost, ArrowLeft, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface AuthProps {
  onBack: () => void;
}

export const Auth = ({ onBack }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Redirect to main page if already logged in
        setTimeout(() => onBack(), 1000);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          toast.success("Connexion réussie!");
          setTimeout(() => onBack(), 1000);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [onBack]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Email ou mot de passe incorrect");
          } else {
            toast.error(error.message);
          }
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("Un compte existe déjà avec cet email");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Compte créé! Vérifiez votre email pour confirmer votre inscription.");
        }
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <Ghost className="w-16 h-16 text-foreground" />
                <div className="absolute inset-0 animate-pulse">
                  <Ghost className="w-16 h-16 text-muted-foreground opacity-50" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Connecté!</h2>
              <p className="text-muted-foreground">Redirection en cours...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="mb-4 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la boutique
        </Button>

        <Card className="border-border shadow-elegant">
          <CardHeader className="text-center space-y-4">
            <div className="relative mx-auto w-12 h-12">
              <Ghost className="w-12 h-12 text-foreground" />
              <div className="absolute inset-0 animate-pulse">
                <Ghost className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              {isLogin ? "Connexion Admin" : "Créer un compte"}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@ghostcommerce.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-border bg-background"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-border bg-background"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-foreground hover:bg-foreground/90 text-background transition-all duration-300 hover:shadow-button"
                disabled={loading}
              >
                {loading ? "Chargement..." : (isLogin ? "Se connecter" : "Créer le compte")}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                {isLogin ? "Créer un nouveau compte" : "Déjà un compte? Se connecter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};