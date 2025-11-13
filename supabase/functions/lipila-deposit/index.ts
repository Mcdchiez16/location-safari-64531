import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DepositRequest {
  amount: number;
  currency?: string;
  accountNumber?: string;
  referenceId?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCVV?: string;
  cardholderName?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency = 'USD', accountNumber, referenceId, cardNumber, cardExpiry, cardCVV, cardholderName } = await req.json() as DepositRequest;

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate card details for new payments
    if (!referenceId && (!cardNumber || !cardExpiry || !cardCVV || !cardholderName)) {
      return new Response(
        JSON.stringify({ error: 'Card details are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lipilaApiKey = Deno.env.get('LIPILA_API_KEY');
    if (!lipilaApiKey) {
      console.error('LIPILA_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if this is a status check request
    if (referenceId) {
      console.log('Checking status for reference:', referenceId);
      const statusResponse = await fetch(
        `https://api.lipila.dev/api/v1/collections/check-status?referenceId=${referenceId}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-api-key': lipilaApiKey,
          },
        }
      );

      const statusData = await statusResponse.json();
      console.log('Status check response:', statusData);

      // Note: For Send flow, balance updates are not needed as funds go directly to receiver via disbursement
      // Balance updates only apply when using this function for direct deposits

      return new Response(
        JSON.stringify(statusData),
        { status: statusResponse.ok ? 200 : statusResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new collection request
    const generatedRefId = crypto.randomUUID();
    console.log('Creating collection for user:', user.id, 'amount:', amount, 'reference:', generatedRefId);

    // Create collection via Lipila API
    const collectionResponse = await fetch('https://api.lipila.dev/api/v1/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'x-api-key': lipilaApiKey,
      },
      body: JSON.stringify({
        amount,
        currency,
        referenceId: generatedRefId,
        paymentType: 'Card',
        cardNumber,
        cardExpiry,
        cardCVV,
        cardholderName,
      }),
    });

    if (!collectionResponse.ok) {
      const errorData = await collectionResponse.text();
      console.error('Lipila API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment request',
          details: errorData 
        }),
        { status: collectionResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const collectionData = await collectionResponse.json();
    console.log('Collection created:', collectionData);

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: generatedRefId,
        ...collectionData,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lipila-deposit function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
