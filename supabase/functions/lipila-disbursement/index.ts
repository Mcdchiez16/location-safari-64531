import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DisbursementRequest {
  amount: number;
  currency?: string;
  accountNumber: string;
  transactionId: string;
  referenceId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { amount, currency = 'ZMW', accountNumber, transactionId, referenceId } = await req.json() as DisbursementRequest;

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!accountNumber) {
      return new Response(
        JSON.stringify({ error: 'Account number is required' }),
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
      console.log('Checking disbursement status for reference:', referenceId);
      const statusResponse = await fetch(
        `https://api.lipila.dev/api/v1/disbursements/check-status?referenceId=${referenceId}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-api-key': lipilaApiKey,
          },
        }
      );

      const statusData = await statusResponse.json();
      console.log('Disbursement status check response:', statusData);

      // If disbursement is successful, update transaction status
      if (statusData.status === 'Successful' && transactionId) {
        const { error: updateError } = await supabaseClient
          .from('transactions')
          .update({ 
            status: 'completed',
            payment_date: new Date().toISOString(),
          })
          .eq('id', transactionId);

        if (updateError) {
          console.error('Error updating transaction:', updateError);
        }
      }

      return new Response(
        JSON.stringify(statusData),
        { status: statusResponse.ok ? 200 : statusResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a new disbursement request
    const generatedRefId = crypto.randomUUID();
    console.log('Creating disbursement, amount:', amount, 'reference:', generatedRefId);

    // Create disbursement via Lipila API
    const disbursementResponse = await fetch('https://api.lipila.dev/api/v1/disbursements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'x-api-key': lipilaApiKey,
      },
      body: JSON.stringify({
        amount,
        currency,
        accountNumber,
        referenceId: generatedRefId,
        paymentType: 'MobileMoney',
      }),
    });

    if (!disbursementResponse.ok) {
      const errorData = await disbursementResponse.text();
      console.error('Lipila API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create disbursement request',
          details: errorData 
        }),
        { status: disbursementResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const disbursementData = await disbursementResponse.json();
    console.log('Disbursement created:', disbursementData);

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: generatedRefId,
        ...disbursementData,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in lipila-disbursement function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
