import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreditRequestData {
  nomeCompleto: string;
  whatsapp: string;
  email: string;
  quantidade: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get("CREDIT_REQUEST_WEBHOOK_URL");
    
    if (!webhookUrl) {
      console.error("CREDIT_REQUEST_WEBHOOK_URL não está configurada");
      return new Response(
        JSON.stringify({ error: "Webhook URL não configurada" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const requestData: CreditRequestData = await req.json();

    // Validação dos dados
    if (!requestData.nomeCompleto || !requestData.whatsapp || !requestData.email || !requestData.quantidade) {
      return new Response(
        JSON.stringify({ error: "Todos os campos são obrigatórios" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Calcular o total
    const total = requestData.quantidade * 9.90;

    // Preparar dados para o webhook
    const webhookData = {
      nomeCompleto: requestData.nomeCompleto,
      whatsapp: requestData.whatsapp,
      email: requestData.email,
      quantidade: requestData.quantidade,
      total: total.toFixed(2),
      timestamp: new Date().toISOString()
    };

    console.log("Enviando dados para webhook:", webhookData);

    // Enviar para o webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    });

    if (!webhookResponse.ok) {
      console.error("Erro ao enviar para webhook:", webhookResponse.status);
      return new Response(
        JSON.stringify({ error: "Erro ao processar pedido" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Pedido de créditos enviado com sucesso");

    return new Response(
      JSON.stringify({ success: true, message: "Pedido enviado com sucesso" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Erro na função request-credits:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
