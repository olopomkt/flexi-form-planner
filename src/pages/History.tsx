import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitnessButton } from "@/components/ui/fitness-button";
import { useNavigate } from "react-router-dom";
import { Target, History as HistoryIcon } from "lucide-react";

export default function History() {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <HistoryIcon className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  Meu Histórico de Planners
                </h1>
              </div>
              <p className="text-muted-foreground">
                Visualize todos os planners que você já gerou
              </p>
            </div>

            <Card className="text-center p-12">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">Nenhum planner gerado ainda</CardTitle>
                <CardDescription className="text-base">
                  Você ainda não gerou nenhum planner. Seus planos salvos aparecerão aqui.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FitnessButton
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/planner")}
                  className="px-8"
                >
                  Gerar Novo Planner
                </FitnessButton>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}