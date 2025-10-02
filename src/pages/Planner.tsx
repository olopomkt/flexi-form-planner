import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FitnessButton } from "@/components/ui/fitness-button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const plannerSchema = z.object({
  nomeCompleto: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  idade: z.number().min(16, "Idade mínima é 16 anos").max(80, "Idade máxima é 80 anos"),
  genero: z.enum(["masculino", "feminino"]),
  peso: z.number().min(40, "Peso mínimo é 40kg").max(200, "Peso máximo é 200kg"),
  altura: z.number().min(140, "Altura mínima é 140cm").max(220, "Altura máxima é 220cm"),
  percentualGordura: z.number().min(5).max(50).optional(),
  nivelExperiencia: z.enum(["iniciante", "intermediario", "avancado", "profissional"]),
  disposicaoFisica: z.enum(["natural", "uso_hormonal"]),
  biotipo: z.enum(["ectomorfo", "mesomorfo", "endomorfo"]),
  frequenciaSemanal: z.enum(["3", "5", "7"]),
  objetivoPrincipal: z.enum(["secar_muito", "emagrecimento_moderado", "ganho_massa_moderado", "bulk_extremo"]),
  grupoMuscularPrioritario: z.array(z.string()).max(3, "Máximo 3 grupos musculares"),
  segueDieta: z.enum(["sim", "nao"]),
  gastoCaloricoNivel: z.enum(["leve", "medio", "bom", "muito"]),
  tomaSuplemento: z.enum(["sim", "nao"]),
  quaisSuplemento: z.string().optional(),
  fazAnabolizante: z.enum(["sim", "nao"]),
  quaisAnabolizante: z.string().optional(),
  rotinaDiaria: z.enum(["tranquila", "moderada", "apertada", "corrida"]),
  pretendeCardio: z.enum(["sim", "nao"]),
  tempoResultado: z.number().min(1, "Mínimo 1"),
  unidadeTempo: z.enum(["dias", "meses", "anos"]),
});

type PlannerFormData = z.infer<typeof plannerSchema>;

const gruposMusculares = [
  { id: "peito", label: "Peito" },
  { id: "costas", label: "Costas" },
  { id: "trapezio", label: "Trapézio" },
  { id: "ombros", label: "Ombros" },
  { id: "biceps", label: "Bíceps" },
  { id: "triceps", label: "Tríceps" },
  { id: "quadriceps", label: "Quadríceps" },
  { id: "posteriores", label: "Posteriores" },
  { id: "gluteos", label: "Glúteos" },
  { id: "panturrilha", label: "Panturrilha" },
];

export default function Planner() {
  const [showSuplemento, setShowSuplemento] = useState(false);
  const [showAnabolizante, setShowAnabolizante] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, refreshUserData } = useAuth();

  const form = useForm<PlannerFormData>({
    resolver: zodResolver(plannerSchema),
    defaultValues: {
      grupoMuscularPrioritario: [],
    },
  });

  const onSubmit = async (data: PlannerFormData) => {
    if (!user || !session) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para gerar um planner.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificar créditos do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        throw new Error('Erro ao verificar créditos: ' + profileError.message);
      }

      if (!profile || profile.credits === 0) {
        toast({
          title: "Créditos insuficientes",
          description: "Você não tem créditos suficientes. Por favor, adquira mais na página 'Adquirir Créditos'.",
          variant: "destructive"
        });
        navigate('/credits');
        return;
      }

      // 2. Deduzir 1 crédito
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: profile.credits - 1 })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error('Erro ao deduzir créditos: ' + updateError.message);
      }

      // 3. Chamar a Edge Function para gerar o planner
      const { data: result, error: functionError } = await supabase.functions.invoke('generate-planner', {
        body: { userInputs: data }
      });

      if (functionError) {
        // Se der erro, devolver o crédito
        await supabase
          .from('profiles')
          .update({ credits: profile.credits })
          .eq('user_id', user.id);
        
        throw new Error('Erro ao gerar planner: ' + functionError.message);
      }

      if (!result?.id) {
        // Se der erro, devolver o crédito
        await supabase
          .from('profiles')
          .update({ credits: profile.credits })
          .eq('user_id', user.id);
        
        throw new Error('Erro: ID do planner não retornado');
      }

      // 4. Atualizar os dados do usuário no contexto
      await refreshUserData();

      // 5. Redirecionar para a página de resultado
      toast({
        title: "Planner gerado com sucesso!",
        description: "Redirecionando para os resultados...",
      });

      navigate(`/result/${result.id}`);

    } catch (error) {
      console.error('Erro ao gerar planner:', error);
      toast({
        title: "Erro ao gerar planner",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Preencha seus dados para gerar o plano de treino
              </h1>
              <p className="text-muted-foreground">
                Forneça informações detalhadas para um planner personalizado
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Seção 1: Informações Básicas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>
                      Dados pessoais essenciais para o planner
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nomeCompleto"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="idade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idade</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Sua idade"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="genero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione seu gênero" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="peso"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Seu peso em kg"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="altura"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Altura (cm)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Sua altura em cm"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="percentualGordura"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Percentual de Gordura (%) <span className="text-muted-foreground text-sm">opcional</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Percentual de gordura"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Seção 2: Experiência e Objetivos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Experiência e Objetivos</CardTitle>
                    <CardDescription>
                      Informações sobre seu nível e metas de treino
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nivelExperiencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nível de Experiência de Treino</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione seu nível" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="iniciante">Iniciante</SelectItem>
                                <SelectItem value="intermediario">Intermediário</SelectItem>
                                <SelectItem value="avancado">Avançado</SelectItem>
                                <SelectItem value="profissional">Profissional</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="disposicaoFisica"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Disposição Física</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione sua disposição" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="natural">Natural</SelectItem>
                                <SelectItem value="uso_hormonal">Uso Hormonal</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="biotipo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Biotipo Corporal</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione seu biotipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ectomorfo">Ectomorfo (magro)</SelectItem>
                                <SelectItem value="mesomorfo">Mesomorfo (atlético)</SelectItem>
                                <SelectItem value="endomorfo">Endomorfo (robusto)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="frequenciaSemanal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Frequência de Treinos Semanal</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Quantas vezes por semana" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="3">3 vezes</SelectItem>
                                <SelectItem value="5">5 vezes</SelectItem>
                                <SelectItem value="7">7 vezes</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="objetivoPrincipal"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Objetivo Principal</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione seu objetivo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="secar_muito">Secar muito</SelectItem>
                                <SelectItem value="emagrecimento_moderado">Emagrecimento Moderado</SelectItem>
                                <SelectItem value="ganho_massa_moderado">Ganho de Massa Moderado</SelectItem>
                                <SelectItem value="bulk_extremo">Bulk Extremo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="grupoMuscularPrioritario"
                      render={() => (
                        <FormItem>
                          <FormLabel>Grupo Muscular Prioritário (escolha até 3)</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            {gruposMusculares.map((grupo) => (
                              <FormField
                                key={grupo.id}
                                control={form.control}
                                name="grupoMuscularPrioritario"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={grupo.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(grupo.id)}
                                          onCheckedChange={(checked) => {
                                            const updatedValue = checked
                                              ? [...(field.value || []), grupo.id]
                                              : field.value?.filter((value) => value !== grupo.id) || [];
                                            
                                            if (updatedValue.length <= 3) {
                                              field.onChange(updatedValue);
                                            }
                                          }}
                                          disabled={
                                            !field.value?.includes(grupo.id) && 
                                            (field.value?.length || 0) >= 3
                                          }
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-normal">
                                        {grupo.label}
                                      </FormLabel>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Seção 3: Estilo de Vida e Suplementação */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estilo de Vida e Suplementação</CardTitle>
                    <CardDescription>
                      Informações sobre sua rotina e suplementação
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="segueDieta"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Tem disponibilidade para seguir dietas?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sim" id="dieta-sim" />
                                <Label htmlFor="dieta-sim">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="nao" id="dieta-nao" />
                                <Label htmlFor="dieta-nao">Não</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gastoCaloricoNivel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Gasto Calórico Diário</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione seu nível de atividade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="leve">Leve</SelectItem>
                              <SelectItem value="medio">Médio</SelectItem>
                              <SelectItem value="bom">Bom</SelectItem>
                              <SelectItem value="muito">Muito</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tomaSuplemento"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Toma suplementos?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value);
                                setShowSuplemento(value === "sim");
                              }}
                              defaultValue={field.value}
                              className="flex flex-row space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sim" id="suplemento-sim" />
                                <Label htmlFor="suplemento-sim">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="nao" id="suplemento-nao" />
                                <Label htmlFor="suplemento-nao">Não</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {showSuplemento && (
                      <FormField
                        control={form.control}
                        name="quaisSuplemento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quais suplementos? (separe por vírgula)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ex: Whey protein, Creatina, BCAA"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="fazAnabolizante"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Faz uso de anabolizantes?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value);
                                setShowAnabolizante(value === "sim");
                              }}
                              defaultValue={field.value}
                              className="flex flex-row space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sim" id="anabolizante-sim" />
                                <Label htmlFor="anabolizante-sim">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="nao" id="anabolizante-nao" />
                                <Label htmlFor="anabolizante-nao">Não</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {showAnabolizante && (
                      <FormField
                        control={form.control}
                        name="quaisAnabolizante"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quais substâncias? (separe por vírgula)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Digite as substâncias utilizadas"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={form.control}
                      name="rotinaDiaria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Como é sua Rotina Diária?</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione sua rotina" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tranquila">Tranquila</SelectItem>
                              <SelectItem value="moderada">Moderada</SelectItem>
                              <SelectItem value="apertada">Apertada</SelectItem>
                              <SelectItem value="corrida">Corrida</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pretendeCardio"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Pretende fazer exercícios de Cardio?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sim" id="cardio-sim" />
                                <Label htmlFor="cardio-sim">Sim</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="nao" id="cardio-nao" />
                                <Label htmlFor="cardio-nao">Não</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Seção 4: Metas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Metas</CardTitle>
                    <CardDescription>
                      Defina seu prazo para alcançar os resultados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <FormField
                        control={form.control}
                        name="tempoResultado"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Em quanto tempo quer alcançar os resultados?</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Digite o tempo"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unidadeTempo"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="block sm:hidden">Unidade</FormLabel>
                            <FormLabel className="hidden sm:block">&nbsp;</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Unidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="dias">Dias</SelectItem>
                                <SelectItem value="meses">Meses</SelectItem>
                                <SelectItem value="anos">Anos</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Botão de Submissão */}
                <div className="flex justify-center pt-6">
                  <FitnessButton
                    type="submit"
                    size="lg"
                    variant="primary"
                    className="px-12 py-4 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Gerando Planner..." : "Gerar Planner Completo"}
                  </FitnessButton>
                </div>
              </form>
            </Form>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}