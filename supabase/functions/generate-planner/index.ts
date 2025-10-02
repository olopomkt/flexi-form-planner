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
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get N8N webhook URL from secrets
    const n8nWebhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!n8nWebhookUrl) {
      throw new Error('N8N_WEBHOOK_URL secret not configured');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the user token and get user info
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { userInputs } = await req.json();
    if (!userInputs) {
      return new Response(JSON.stringify({ error: 'Missing userInputs in request body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending data to N8N webhook:', userInputs);

    // Call N8N webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userInputs),
    });

    if (!n8nResponse.ok) {
      console.error('N8N webhook error:', n8nResponse.status, n8nResponse.statusText);
      throw new Error(`N8N webhook failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
    }

    // Parse the response from N8N - it's an array with the first element containing the output
    const n8nResponseData = await n8nResponse.json();
    console.log('Received raw response from N8N:', n8nResponseData);
    
    // Access the first element and get the output field
    if (!Array.isArray(n8nResponseData) || n8nResponseData.length === 0) {
      throw new Error('Invalid N8N response format: expected an array');
    }
    
    const firstElement = n8nResponseData[0];
    if (!firstElement.output) {
      throw new Error('Invalid N8N response format: missing output field');
    }
    
    // Parse the output string to get the final JSON object
    const aiOutputs = JSON.parse(firstElement.output);
    console.log('Parsed AI outputs:', aiOutputs);

    // Save to planners_history table
    const { data: plannerRecord, error: saveError } = await supabase
      .from('planners_history')
      .insert({
        user_id: user.id,
        user_inputs: userInputs,
        ai_outputs: aiOutputs,
      })
      .select('id')
      .single();

    if (saveError) {
      console.error('Error saving to planners_history:', saveError);
      throw new Error('Failed to save planner to database');
    }

    console.log('Successfully saved planner with ID:', plannerRecord.id);

    return new Response(JSON.stringify({ id: plannerRecord.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-planner function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});