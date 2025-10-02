import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitnessCard, FitnessCardContent, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card";
import { FitnessButton } from "@/components/ui/fitness-button";
import { useNavigate } from "react-router-dom";
import { Target, History as HistoryIcon, Calendar, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface PlannerRecord {
  id: string;
  created_at: string;
  user_inputs: {
    objetivo?: string;
  };
}

export default function History() {
  const navigate = useNavigate();
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [planners, setPlanners] = useState<PlannerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlanners = async () => {
      if (!user) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("planners_history")
        .select("id, created_at, user_inputs")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setPlanners(data as PlannerRecord[]);
      }
      setLoading(false);
    };

    fetchPlanners();
  }, [user]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleDelete = async (plannerId: string) => {
    try {
      const { error } = await supabase
        .from('planners_history')
        .delete()
        .eq('id', plannerId);

      if (error) throw error;

      // Remove from local state
      setPlanners(prev => prev.filter(p => p.id !== plannerId));
      
      // Refresh user data to update counts
      await refreshUserData();

      toast({
        title: "Planner deletado",
        description: "O planner foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar planner:', error);
      toast({
        title: "Erro ao deletar",
        description: "Não foi possível deletar o planner. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
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

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            ) : planners.length === 0 ? (
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planners.map((planner) => (
                  <FitnessCard
                    key={planner.id}
                    className="hover:scale-105 transition-transform duration-300 relative"
                  >
                    <FitnessCardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <FitnessCardTitle className="text-lg">
                          Planner Gerado em:
                        </FitnessCardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {formatDate(planner.created_at)}
                      </p>
                    </FitnessCardHeader>
                    <FitnessCardContent>
                      <div 
                        className="flex items-start gap-2 cursor-pointer mb-4"
                        onClick={() => navigate(`/result/${planner.id}`)}
                      >
                        <Target className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Objetivo:
                          </p>
                          <p className="text-sm text-foreground">
                            {planner.user_inputs?.objetivo || "Não especificado"}
                          </p>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <FitnessButton
                            variant="outline"
                            size="sm"
                            className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </FitnessButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja deletar este planner? A ação é irreversível.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(planner.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </FitnessCardContent>
                  </FitnessCard>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}