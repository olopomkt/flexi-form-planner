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
    // 1. Cria o cliente Supabase que atua EM NOME DO USUÁRIO, passando seu token.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado. Token inválido ou expirado.");

    const { userInputs } = await req.json();
    if (!userInputs) throw new Error("Dados do formulário não recebidos.");

    // 2. Transação: Verifica e deduz o crédito DENTRO da função segura.
    // Usamos um cliente com service_role para a transação para garantir que ela ocorra,
    // mas baseada no user.id verificado, o que é seguro.
    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: profile, error: profileError } = await supabaseAdmin.from('profiles').select('credits').eq('user_id', user.id).single();
    if (profileError || !profile) throw new Error("Perfil do usuário não encontrado.");
    if (profile.credits < 1) throw new Error("Créditos insuficientes.");

    const { error: updateError } = await supabaseAdmin.from('profiles').update({ credits: profile.credits - 1 }).eq('user_id', user.id);
    if (updateError) throw updateError;
    
    // 3. Chama o N8N e processa a resposta corretamente.
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!n8nWebhookUrl) throw new Error("URL do webhook do N8N não configurada.");
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userInputs),
    });

    if (!n8nResponse.ok) throw new Error(`Erro no webhook do N8N: ${n8nResponse.statusText}`);

    const n8nResult = await n8nResponse.json();
    
    // 4. LÓGICA CRÍTICA DE PARSE: "Descasca" o JSON da string de output.
    if (!Array.isArray(n8nResult) || !n8nResult[0] || typeof n8nResult[0].output !== 'string') {
      throw new Error('A resposta do N8N não está no formato esperado.');
    }
    const finalAiOutputs = JSON.parse(n8nResult[0].output);

    // 5. Salva no histórico usando o cliente do usuário (que tem permissão RLS).
    const { data: plannerRecord, error: saveError } = await supabaseClient
      .from('planners_history')
      .insert({ user_id: user.id, user_inputs: userInputs, ai_outputs: finalAiOutputs })
      .select('id')
      .single();

    if (saveError) throw saveError;

    // 6. Retorna o ID para o frontend.
    return new Response(JSON.stringify({ id: plannerRecord.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao gerar planner';
    console.error('Erro na função generate-planner:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
