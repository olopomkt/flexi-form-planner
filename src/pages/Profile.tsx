import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitnessButton } from "@/components/ui/fitness-button";
import { useAuth } from "@/hooks/useAuth";
import { User, Mail, LogOut } from "lucide-react";

export default function Profile() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Meu Perfil
                </h1>
              </div>
              <p className="text-muted-foreground">
                Gerencie suas informações pessoais e configurações da conta
              </p>
            </div>

            <div className="grid gap-6">
              {/* Card de Informações do Usuário */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Suas informações de cadastro no Treino Planner
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Nome Completo</div>
                      <div className="text-muted-foreground">
                        {user?.user_metadata?.full_name || "Nome não informado"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">Email</div>
                      <div className="text-muted-foreground">
                        {user?.email || "Email não disponível"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">ID</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">ID do Usuário</div>
                      <div className="text-muted-foreground font-mono text-sm">
                        {user?.id || "ID não disponível"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Configurações da Conta */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações da Conta</CardTitle>
                  <CardDescription>
                    Ações relacionadas à sua conta
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                      <div>
                        <div className="font-medium text-foreground">Sair da Conta</div>
                        <div className="text-sm text-muted-foreground">
                          Desconecte-se do Treino Planner
                        </div>
                      </div>
                      <FitnessButton
                        variant="outline"
                        onClick={handleLogout}
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </FitnessButton>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Estatísticas */}
              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>
                    Resumo da sua atividade no Treino Planner
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
                      <div className="text-sm text-muted-foreground">Planners Gerados</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-muted-foreground">0</div>
                      <div className="text-sm text-muted-foreground">Dias de Uso</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}