import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FitnessCard, FitnessCardHeader, FitnessCardTitle, FitnessCardContent } from "@/components/ui/fitness-card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, History, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PlannerOutput {
  visao_geral?: string;
  objetivo_divisao_treino?: string;
  dicas_musculo_enfase?: string;
  dieta_suplementacao?: string;
  tempo_medio_resultados?: string;
  dicas_mentalidade?: string;
  analise_shape?: string;
}

const Result = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plannerData, setPlannerData] = useState<PlannerOutput | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const elemento = document.getElementById("planner-para-exportar");
    if (!elemento) {
      toast({
        title: "Erro",
        description: "Não foi possível encontrar o conteúdo para exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(elemento, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#0a0a0a",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, "PNG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Treino-Planner-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`);

      toast({
        title: "PDF exportado com sucesso!",
        description: "Seu planner foi baixado.",
      });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchPlanner = async () => {
      if (!id) {
        toast({
          title: "Erro",
          description: "ID do planner não encontrado.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("planners_history")
          .select("ai_outputs")
          .eq("id", id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: "Planner não encontrado",
            description: "Não foi possível encontrar este planner.",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        setPlannerData(data.ai_outputs as PlannerOutput);
      } catch (error) {
        console.error("Erro ao buscar planner:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar o planner.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanner();
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-12">
          <div id="planner-para-exportar" className="max-w-5xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Seu Planner de Treino Personalizado
              </h1>
              <p className="text-muted-foreground">
                Seu planejamento estratégico para alcançar seus objetivos
              </p>
            </div>

            <Separator />

            {plannerData?.visao_geral && (
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle>Visão Geral</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {plannerData.visao_geral}
                  </p>
                </FitnessCardContent>
              </FitnessCard>
            )}

            {plannerData?.objetivo_divisao_treino && (
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle>Seu Objetivo + Divisão de Treino Ideal</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {plannerData.objetivo_divisao_treino}
                  </p>
                </FitnessCardContent>
              </FitnessCard>
            )}

            {plannerData?.dicas_musculo_enfase && (
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle>Dicas de Treino - Músculo(s) em Ênfase</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {plannerData.dicas_musculo_enfase}
                  </p>
                </FitnessCardContent>
              </FitnessCard>
            )}

            {plannerData?.dieta_suplementacao && (
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle>Recomendações de Dieta e Suplementação</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {plannerData.dieta_suplementacao}
                  </p>
                </FitnessCardContent>
              </FitnessCard>
            )}

            {plannerData?.tempo_medio_resultados && (
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle>Projeção de Resultados</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {plannerData.tempo_medio_resultados}
                  </p>
                </FitnessCardContent>
              </FitnessCard>
            )}

            {plannerData?.dicas_mentalidade && (
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle>Mentalidade e Motivação</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {plannerData.dicas_mentalidade}
                  </p>
                </FitnessCardContent>
              </FitnessCard>
            )}

            {plannerData?.analise_shape && (
              <FitnessCard>
                <FitnessCardHeader>
                  <FitnessCardTitle>Análise Comparativa (Shape Atual x Projeção)</FitnessCardTitle>
                </FitnessCardHeader>
                <FitnessCardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {plannerData.analise_shape}
                  </p>
                </FitnessCardContent>
              </FitnessCard>
            )}

            <div className="flex flex-wrap gap-4 pt-6">
              <Button
                onClick={() => navigate("/dashboard")}
                variant="outline"
                className="flex-1 min-w-[200px]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel Principal
              </Button>
              <Button
                onClick={() => navigate("/history")}
                variant="outline"
                className="flex-1 min-w-[200px]"
              >
                <History className="mr-2 h-4 w-4" />
                Ver Histórico
              </Button>
              <Button
                onClick={handleExportPDF}
                variant="default"
                className="flex-1 min-w-[200px]"
                disabled={isExporting}
              >
                <FileDown className="mr-2 h-4 w-4" />
                {isExporting ? "Gerando PDF..." : "Exportar em PDF"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Result;
