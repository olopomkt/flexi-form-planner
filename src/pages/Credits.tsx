import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitnessButton } from "@/components/ui/fitness-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Coins } from "lucide-react";

export default function Credits() {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    whatsapp: "",
    email: "",
    quantidade: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nomeCompleto || !formData.whatsapp || !formData.email || !formData.quantidade) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Pedido enviado!",
      description: "Seu pedido foi enviado com sucesso. Entraremos em contato em breve.",
    });

    // Limpar formulário
    setFormData({
      nomeCompleto: "",
      whatsapp: "",
      email: "",
      quantidade: ""
    });
  };

  const calcularTotal = () => {
    const quantidade = parseInt(formData.quantidade) || 0;
    return (quantidade * 9.90).toFixed(2);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Adquirir Novos Créditos
                </h1>
              </div>
              <p className="text-muted-foreground">
                Compre créditos para gerar mais planners personalizados
              </p>
            </div>

            <div className="grid gap-6">
              {/* Card de Informações dos Créditos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    Seus Créditos
                  </CardTitle>
                  <CardDescription>
                    Status atual dos seus créditos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">2</div>
                      <div className="text-sm text-muted-foreground">Créditos Disponíveis</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Créditos Utilizados</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Planners Gerados</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Solicitação de Compra */}
              <Card>
                <CardHeader>
                  <CardTitle>Solicitar Compra de Créditos</CardTitle>
                  <CardDescription>
                    Preencha os dados abaixo para solicitar a compra de novos créditos.
                    <br />
                    <strong>Preço: R$ 9,90 por crédito</strong>
                    <br />
                    Após o envio, nossa equipe entrará em contato para finalizar a compra.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nomeCompleto">Nome Completo</Label>
                        <Input
                          id="nomeCompleto"
                          placeholder="Seu nome completo"
                          value={formData.nomeCompleto}
                          onChange={(e) => handleInputChange("nomeCompleto", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">Contato do WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          placeholder="(11) 99999-9999"
                          value={formData.whatsapp}
                          onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email de Cadastro</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade de Créditos Desejada</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="1"
                          placeholder="Ex: 5"
                          value={formData.quantidade}
                          onChange={(e) => handleInputChange("quantidade", e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {formData.quantidade && parseInt(formData.quantidade) > 0 && (
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">Total a pagar</div>
                          <div className="text-2xl font-bold text-primary">
                            R$ {calcularTotal()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formData.quantidade} crédito{parseInt(formData.quantidade) > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center pt-4">
                      <FitnessButton
                        type="submit"
                        variant="accent"
                        size="lg"
                        className="px-8"
                      >
                        Enviar Pedido
                      </FitnessButton>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}