<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { cartStore } from '$lib/stores/cart.svelte';
	import { createPaymentIntent } from '$lib/services/payment.service';
	import { MinusCircle, PlusCircle, ShoppingCart, Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	// Local state
	let isSubmitting = $state(false);
	let session = authClient.useSession();

	// Make cart items reactive
	let cartItems = $derived(cartStore.cart);
	let cartTotal = $state(0);

	// Extract methods from cart store
	const {
		removeFromCart,
		updateQuantity,
		clearCart,
		getCartTotal,
		getTotalsByCategory,
		cartToOrderInput
	} = cartStore;

	// Update effect to track cart changes
	$effect(() => {
		cartTotal = getCartTotal();
		cartItems = cartStore.cart; // Ensure UI updates when cart changes
	});

	async function handleCheckout() {
		// Check if user is authenticated
		if (!$session.data) {
			toast.error('Please log in to place an order');
			goto('/auth');
			return;
		}

		// Check if cart is empty
		if (cartItems.length === 0) {
			toast.error('Your cart is empty');
			return;
		}

		try {
			isSubmitting = true;
			const orderInput = cartToOrderInput($session.data.user.id);
			const categoryTotals = cartItems.reduce<Record<string, number>>((totals, item) => {
				const category = item.category || 'default';
				totals[category] = (totals[category] || 0) + (Number(item.price) * item.quantity);
				return totals;
			}, {});

			// First create the order in your database
			const orderResponse = await fetch('/api/orders', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(orderInput)
			});

			const orderResult = await orderResponse.json();

			if (!orderResponse.ok) {
				throw new Error(orderResult.error || 'Failed to place order');
			}

			// Then create a payment intent with Stripe
			const paymentIntent = await createPaymentIntent({
				amount: getCartTotal(),
				orderId: orderResult.order.id,
				categoryTotals
			});

			// Navigate to the payment page with all needed parameters
			goto(
				`/checkout/payment?client_secret=${paymentIntent.clientSecret}&order_id=${orderResult.order.id}&category_totals=${encodeURIComponent(JSON.stringify(categoryTotals))}`
			);
		} catch (error) {
			console.error('Error placing order:', error);
			toast.error(
				error instanceof Error ? error.message : 'Failed to place order. Please try again.'
			);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="mb-6 text-3xl font-bold">Your Cart</h1>

	{#if cartItems.length === 0}
		<Card>
			<CardContent class="flex flex-col items-center justify-center py-12">
				<ShoppingCart class="mb-4 h-16 w-16 text-muted-foreground" />
				<p class="text-lg font-medium">Your cart is empty</p>
				<p class="mt-1 text-sm text-muted-foreground">Add items from the menu to get started</p>
				<Button class="mt-6" onclick={() => goto('/dashboard?tab=menu')}>View Menu</Button>
			</CardContent>
		</Card>
	{:else}
		<div class="grid gap-6 md:grid-cols-3">
			<!-- Cart Items (Left 2/3) -->
			<div class="space-y-4 md:col-span-2">
				{#each cartItems as item (item.id + item.size)}
					<Card>
						<div class="flex p-4">
							<div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-muted">
								<img
									src={item.imageUrl || 'https://placehold.co/100x100?text=Food'}
									alt={item.name}
									class="h-full w-full object-cover object-center"
								/>
							</div>
							<div class="ml-4 flex flex-1 flex-col">
								<div class="flex justify-between text-base font-medium">
									<h3>{item.name}</h3>
									<p class="ml-4">{item.price}</p>
								</div>
								<p class="mt-1 text-sm text-muted-foreground">Size: {item.size}</p>
								<div class="flex flex-1 items-end justify-between text-sm">
									<div class="flex items-center space-x-2">
										<Button
											variant="outline"
											size="icon"
											class="h-8 w-8"
											onclick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
											disabled={item.quantity <= 1}
										>
											<MinusCircle class="h-4 w-4" />
										</Button>
										<Input
											type="number"
											min="1"
											class="h-8 w-16 text-center"
											value={item.quantity}
											onchange={(e) =>
												updateQuantity(item.id, item.size, parseInt(e.currentTarget.value || '1'))}
										/>
										<Button
											variant="outline"
											size="icon"
											class="h-8 w-8"
											onclick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
										>
											<PlusCircle class="h-4 w-4" />
										</Button>
									</div>
									<Button
										variant="ghost"
										size="sm"
										class="text-destructive"
										onclick={() => removeFromCart(item.id, item.size)}
									>
										<Trash2 class="mr-1 h-4 w-4" />
										Remove
									</Button>
								</div>
							</div>
						</div>
					</Card>
				{/each}
			</div>

			<!-- Order Summary (Right 1/3) -->
			<div>
				<Card>
					<CardHeader>
						<CardTitle>Order Summary</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="space-y-4">
							<div class="flex justify-between">
								<span>Subtotal</span>
								<span>₹{cartTotal.toFixed(2)}</span>
							</div>
							<Separator />
							<div class="flex justify-between font-medium">
								<span>Total</span>
								<span>₹{cartTotal.toFixed(2)}</span>
							</div>
						</div>
					</CardContent>
					<CardFooter class="flex flex-col gap-2">
						<Button
							class="w-full"
							onclick={handleCheckout}
							disabled={isSubmitting || cartItems.length === 0}
						>
							{isSubmitting ? 'Processing...' : 'Place Order'}
						</Button>
						<Button variant="outline" class="w-full" onclick={() => goto('/dashboard?tab=menu')}>
							Continue Shopping
						</Button>
						<Button
							variant="ghost"
							class="w-full text-destructive"
							onclick={() => {
								clearCart();
								toast.success('Cart cleared');
							}}
						>
							Clear Cart
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	{/if}
</div>
