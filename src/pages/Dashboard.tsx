import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { FitnessCard, FitnessCardHeader, FitnessCardTitle, FitnessCardContent } from "@/components/ui/fitness-card";
import { FitnessButton } from "@/components/ui/fitness-button";
import { Badge } from "@/components/ui/badge";
import { Target, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { profile, user, plannersCount } = useAuth();
  const navigate = useNavigate();

  const handleGeneratePlanner = () => {
    navigate('/planner');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center border-b px-4 bg-card/50 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="ml-4">
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  Olá, {profile?.full_name || user?.email?.split('@')[0] || 'Atleta'}! 👋
                </h1>
                <p className="text-muted-foreground text-lg">
                  Pronto para conquistar seus objetivos fitness hoje?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Credits Card */}
                <FitnessCard>
                  <FitnessCardHeader>
                    <div className="flex items-center justify-between">
                      <FitnessCardTitle className="text-xl">Seus Créditos</FitnessCardTitle>
                      <Zap className="h-6 w-6 text-accent" />
                    </div>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-2xl px-4 py-2">
                          {profile?.credits || 0}
                        </Badge>
                        <span className="text-muted-foreground">créditos disponíveis</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Cada planner personalizado consome 1 crédito. 
                        Você pode comprar mais créditos quando necessário.
                      </p>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>

                {/* Action Card */}
                <FitnessCard>
                  <FitnessCardHeader>
                    <div className="flex items-center justify-between">
                      <FitnessCardTitle className="text-xl">Próximo Passo</FitnessCardTitle>
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                  </FitnessCardHeader>
                  <FitnessCardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        Crie um planner de treino personalizado baseado nos seus objetivos e nível de experiência.
                      </p>
                      <FitnessButton 
                        onClick={handleGeneratePlanner}
                        variant="primary"
                        size="lg"
                        className="w-full"
                        disabled={(profile?.credits || 0) === 0}
                      >
                        <Target className="h-5 w-5 mr-2" />
                        GERAR NOVO PLANNER
                      </FitnessButton>
                      {(profile?.credits || 0) === 0 && (
                        <p className="text-sm text-destructive text-center">
                          Você precisa de créditos para gerar um planner
                        </p>
                      )}
                    </div>
                  </FitnessCardContent>
                </FitnessCard>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FitnessCard>
                  <FitnessCardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-primary">{plannersCount}</div>
                      <div className="text-sm text-muted-foreground">Planners Criados</div>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>

                <FitnessCard>
                  <FitnessCardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-accent">0</div>
                      <div className="text-sm text-muted-foreground">Dias de Treino</div>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>

                <FitnessCard>
                  <FitnessCardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-secondary">Iniciante</div>
                      <div className="text-sm text-muted-foreground">Nível Atual</div>
                    </div>
                  </FitnessCardContent>
                </FitnessCard>
              </div>

              {/* Motivational Quote */}
              <FitnessCard>
                <FitnessCardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <p className="text-lg italic text-muted-foreground">
                      "O sucesso é a soma de pequenos esforços repetidos dia após dia"
                    </p>
                    <p className="text-sm text-muted-foreground/70">
                      - Robert Collier
                    </p>
                  </div>
                </FitnessCardContent>
              </FitnessCard>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;