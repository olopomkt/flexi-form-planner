import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FitnessCard, FitnessCardContent, FitnessCardHeader, FitnessCardTitle } from "@/components/ui/fitness-card";
import { FitnessButton } from "@/components/ui/fitness-button";
import { useNavigate } from "react-router-dom";
import { Target, History as HistoryIcon, Calendar, Trash2, Loader2 } from "lucide-react";
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
    objetivoPrincipal?: string;
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

      if (error) {
        toast({ title: "Erro", description: "Não foi possível carregar o histórico.", variant: "destructive" });
      } else if (data) {
        setPlanners(data as PlannerRecord[]);
      }
      setLoading(false);
    };
    fetchPlanners();
  }, [user, toast]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const handleDelete = async (plannerId: string) => {
    const { error } = await supabase.from('planners_history').delete().eq('id', plannerId);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      setPlanners(prev => prev.filter(p => p.id !== plannerId));
      await refreshUserData();
      toast({ title: "Sucesso", description: "Planner deletado permanentemente." });
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
                  Histórico de Planners
                </h1>
              </div>
              <p className="text-muted-foreground">
                Todos os planners que você já gerou
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : planners.length === 0 ? (
              <Card className="text-center p-12">
                <CardHeader>
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <CardTitle>Nenhum planner gerado ainda</CardTitle>
                  <CardDescription>
                    Crie seu primeiro planner personalizado para começar sua jornada fitness!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FitnessButton
                    onClick={() => navigate('/planner')}
                    variant="primary"
                    size="lg"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    GERAR PRIMEIRO PLANNER
                  </FitnessButton>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {planners.map((planner) => (
                  <FitnessCard key={planner.id} className="flex flex-col justify-between">
                    <div className="cursor-pointer" onClick={() => navigate(`/result/${planner.id}`)}>
                      <FitnessCardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <FitnessCardTitle className="text-lg">Gerado em:</FitnessCardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">{formatDate(planner.created_at)}</p>
                      </FitnessCardHeader>
                      <FitnessCardContent>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Objetivo:</p>
                        <p className="text-sm text-foreground capitalize">
                          {(planner.user_inputs?.objetivoPrincipal || "Não especificado").replace(/_/g, ' ')}
                        </p>
                      </FitnessCardContent>
                    </div>
                    <div className="p-4 pt-0">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <FitnessButton variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                            <Trash2 className="h-4 w-4 mr-2" /> Deletar
                          </FitnessButton>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita. Isso irá deletar permanentemente seu planner.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(planner.id)} className="bg-destructive hover:bg-destructive/80">Confirmar Exclusão</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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