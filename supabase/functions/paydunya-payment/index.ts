import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const body = await req.json()
    const { 
      amount, 
      customerInfo, 
      orderItems, 
      paymentMethod 
    } = body

    console.log('Processing payment:', { amount, paymentMethod, customerInfo })

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        total_amount: amount,
        payment_method: paymentMethod,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      throw new Error('Failed to create order')
    }

    // Create order items
    const orderItemsData = orderItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItemsData)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      throw new Error('Failed to create order items')
    }

    // PayDunya API integration (simulation for demo)
    // In production, you would integrate with actual PayDunya API
    const paydunyaResponse = {
      status: 'success',
      payment_url: `https://paydunya.com/checkout/${order.id}`,
      transaction_id: `txn_${Date.now()}`,
      order_id: order.id
    }

    // For demo purposes, we'll simulate different payment methods
    let paymentUrl = paydunyaResponse.payment_url
    
    switch (paymentMethod) {
      case 'wave':
        paymentUrl = `https://wave.sn/pay/${order.id}`
        break
      case 'orange-money':
        paymentUrl = `https://orange-money.com/pay/${order.id}`
        break
      default:
        paymentUrl = `https://paydunya.com/checkout/${order.id}`
    }

    console.log('Payment initiated:', { orderId: order.id, paymentUrl })

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        order_id: order.id,
        transaction_id: paydunyaResponse.transaction_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Payment processing error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Payment processing failed' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})