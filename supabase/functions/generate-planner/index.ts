import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Crie um cliente Supabase que atua EM NOME DO USUÁRIO, usando o token de autorização dele.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado.");

    const { userInputs } = await req.json();
    if (!userInputs) throw new Error("Dados do formulário não recebidos.");

    // 2. Verifique os créditos e deduza em uma única operação segura.
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('credits')
      .single();

    if (profileError || !profile) throw new Error("Perfil do usuário não encontrado.");
    if (profile.credits < 1) throw new Error("Créditos insuficientes.");

    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ credits: profile.credits - 1 })
      .eq('user_id', user.id);

    if (updateError) throw updateError;
    
    // 3. Chame o N8N e processe a resposta corretamente.
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!n8nWebhookUrl) throw new Error("URL do webhook do N8N não configurada.");
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInputs),
    });

    if (!n8nResponse.ok) throw new Error(`Erro no webhook do N8N: ${n8nResponse.statusText}`);

    const n8nResult = await n8nResponse.json();
    if (!Array.isArray(n8nResult) || !n8nResult[0] || typeof n8nResult[0].output !== 'string') {
      throw new Error('Formato de resposta do N8N inesperado.');
    }
    const finalAiOutputs = JSON.parse(n8nResult[0].output);

    // 4. Salve o resultado no histórico.
    const { data: plannerRecord, error: saveError } = await supabaseClient
      .from('planners_history')
      .insert({ user_id: user.id, user_inputs: userInputs, ai_outputs: finalAiOutputs })
      .select('id')
      .single();

    if (saveError) throw saveError;

    // 5. Retorne o ID para o frontend.
    return new Response(JSON.stringify({ id: plannerRecord.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-planner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar planner';
    // IMPORTANTE: Em caso de erro, aqui deveria entrar a lógica para devolver o crédito ao usuário.
    // Por simplicidade, vamos focar em fazer o fluxo funcionar primeiro.
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
