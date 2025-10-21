<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { loadStripe } from '@stripe/stripe-js';
  import type { Stripe, StripeElements } from '@stripe/stripe-js';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { PUBLIC_STRIPE_KEY } from '$env/static/public';
  import { cartStore } from '$lib/stores/cart.svelte';

  const clientSecret = $page.url.searchParams.get('client_secret');
  const orderId = $page.url.searchParams.get('order_id');
  
  let stripe: Stripe | null;
  let elements: StripeElements | null;
  let paymentElement;
  let isProcessing = $state(false);
  let isLoaded = $state(false);
  let error = $state('');

  onMount(async () => {
    try {
      stripe = await loadStripe(PUBLIC_STRIPE_KEY);
      
      if (!stripe || !clientSecret) {
        error = 'Failed to initialize payment';
        return;
      }
      
      elements = stripe.elements({
        clientSecret,
        appearance: { theme: 'stripe' }
      });
      
      paymentElement = elements.create('payment');
      paymentElement.mount('#payment-element');
      isLoaded = true;
    } catch (e) {
      console.error('Error initializing Stripe:', e);
      error = 'Failed to initialize payment system';
    }
  });

  async function handleSubmit() {
    if (!stripe || !elements || !clientSecret || !orderId) {
      return;
    }

    isProcessing = true;

    try {
      const result = await stripe.confirmPayment({
        elements,
        redirect: 'if_required'
      });

      if (result.error) {
        error = result.error.message ?? 'Payment failed';
      } else if (result.paymentIntent?.status === 'succeeded') {
        cartStore.clearCart();
        goto(`/checkout/success?order_id=${orderId}`);
      }
    } catch (e) {
      console.error('Payment error:', e);
      error = 'Payment failed. Please try again.';
    } finally {
      isProcessing = false;
    }
  }
</script>
  
  <div class="container mx-auto px-4 py-8">
    <h1 class="mb-6 text-3xl font-bold">Complete Your Payment</h1>
  
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
        <p>{error}</p>
      </div>
    {/if}
  
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div id="payment-element" class="p-4 border rounded-md mb-4"></div>
      </CardContent>
      <CardFooter>
        <Button 
          class="w-full" 
          onclick={handleSubmit} 
          disabled={isProcessing || !isLoaded}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </CardFooter>
    </Card>
  </div>