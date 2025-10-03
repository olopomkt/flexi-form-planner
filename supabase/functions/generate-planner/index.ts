import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Autenticação inválida.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { userInputs } = await req.json();
    if (!userInputs) {
      throw new Error('Nenhum dado do formulário foi recebido (userInputs).');
    }

    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!n8nWebhookUrl) {
      throw new Error('A URL do webhook do N8N não está configurada nos segredos do Supabase.');
    }

    // Chama o webhook do N8N
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInputs),
    });

    if (!n8nResponse.ok) {
      const errorBody = await n8nResponse.text();
      throw new Error(`Erro no webhook do N8N: ${n8nResponse.status} ${errorBody}`);
    }

    const n8nResult = await n8nResponse.json();

    // ** LÓGICA CRÍTICA DE CORREÇÃO **
    // Extrai e faz o parse duplo da resposta do N8N
    if (!Array.isArray(n8nResult) || !n8nResult[0] || typeof n8nResult[0].output !== 'string') {
      throw new Error('A resposta do N8N não está no formato esperado: [ { "output": "{...}" } ].');
    }

    const aiOutputString = n8nResult[0].output;
    const finalAiOutputs = JSON.parse(aiOutputString);

    // Salva no banco de dados
    const { data: plannerRecord, error: saveError } = await supabase
      .from('planners_history')
      .insert({
        user_id: user.id,
        user_inputs: userInputs,
        ai_outputs: finalAiOutputs, // Salva o JSON final e limpo
      })
      .select('id')
      .single();

    if (saveError) {
      throw saveError;
    }

    return new Response(JSON.stringify({ id: plannerRecord.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função generate-planner:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar planner';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
